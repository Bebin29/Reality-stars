import { supabaseClient, supabaseAdmin } from '@/config/database';
import {
  Personality,
  CreatePersonalityRequest,
  PersonalityQueryParams,
  PaginatedResponse,
  ApiResponse
} from '@/types/database';

export class PersonalityService {
  // Get all personalities with pagination and filtering
  async getPersonalities(params: PersonalityQueryParams): Promise<PaginatedResponse<Personality[]>> {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        gender,
        nationality,
        sort_by = 'created_at',
        sort_order = 'desc'
      } = params;

      const offset = (page - 1) * limit;

      let query = supabaseClient
        .from('personality')
        .select('*', { count: 'exact' });

      // Apply filters
      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
      }

      if (gender) {
        query = query.eq('gender', gender);
      }

      if (nationality) {
        query = query.eq('nationality', nationality);
      }

      // Apply sorting
      query = query.order(sort_by, { ascending: sort_order === 'asc' });

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to fetch personalities: ${error.message}`);
      }

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        success: true,
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages
        }
      };
    } catch (error) {
      console.error('Error in getPersonalities:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Get personality by ID with related data
  async getPersonalityById(id: string): Promise<ApiResponse<Personality>> {
    try {
      const { data, error } = await supabaseClient
        .from('personality')
        .select(`
          *,
          social_media_account (
            *,
            social_media_platform (*)
          ),
          appearance (
            *,
            tv_show (*),
            episode (*)
          ),
          controversy (*),
          award (*),
          media (*),
          external_link (*)
        `)
        .eq('personality_id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: 'Personality not found'
          };
        }
        throw new Error(`Failed to fetch personality: ${error.message}`);
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error in getPersonalityById:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Create new personality
  async createPersonality(personalityData: CreatePersonalityRequest): Promise<ApiResponse<Personality>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('personality')
        .insert([{
          ...personalityData,
          birth_date: personalityData.birth_date ? new Date(personalityData.birth_date) : null
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create personality: ${error.message}`);
      }

      return {
        success: true,
        data,
        message: 'Personality created successfully'
      };
    } catch (error) {
      console.error('Error in createPersonality:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Update personality
  async updatePersonality(id: string, updates: Partial<CreatePersonalityRequest>): Promise<ApiResponse<Personality>> {
    try {
      const updateData = {
        ...updates,
        birth_date: updates.birth_date ? new Date(updates.birth_date) : undefined,
        updated_at: new Date()
      };

      const { data, error } = await supabaseAdmin
        .from('personality')
        .update(updateData)
        .eq('personality_id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: 'Personality not found'
          };
        }
        throw new Error(`Failed to update personality: ${error.message}`);
      }

      return {
        success: true,
        data,
        message: 'Personality updated successfully'
      };
    } catch (error) {
      console.error('Error in updatePersonality:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Delete personality
  async deletePersonality(id: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabaseAdmin
        .from('personality')
        .delete()
        .eq('personality_id', id);

      if (error) {
        throw new Error(`Failed to delete personality: ${error.message}`);
      }

      return {
        success: true,
        data: null,
        message: 'Personality deleted successfully'
      };
    } catch (error) {
      console.error('Error in deletePersonality:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Search personalities by name
  async searchPersonalities(searchTerm: string, limit: number = 10): Promise<ApiResponse<Personality[]>> {
    try {
      const { data, error } = await supabaseClient
        .from('personality')
        .select('personality_id, first_name, last_name, profile_image')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
        .limit(limit);

      if (error) {
        throw new Error(`Failed to search personalities: ${error.message}`);
      }

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Error in searchPersonalities:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Get personalities by TV show
  async getPersonalitiesByShow(showId: string): Promise<ApiResponse<Personality[]>> {
    try {
      const { data, error } = await supabaseClient
        .from('appearance')
        .select(`
          personality (*)
        `)
        .eq('show_id', showId);

      if (error) {
        throw new Error(`Failed to fetch personalities by show: ${error.message}`);
      }

      const personalities = data?.map((item: unknown) => (item as { personality: Personality }).personality).filter(Boolean) as Personality[] || [];

      return {
        success: true,
        data: personalities
      };
    } catch (error) {
      console.error('Error in getPersonalitiesByShow:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Get avatar information for all personalities
  async getPersonalitiesWithAvatars(): Promise<ApiResponse<{ personality_id: string; first_name: string; last_name: string; has_avatar: boolean; shows: string[]; latest_show?: string | undefined }[]>> {
    try {
      // First, get all personalities with basic info and their show appearances
      const { data: personalities, error: personalitiesError } = await supabaseClient
        .from('personality')
        .select(`
          personality_id, 
          first_name, 
          last_name,
          appearance (
            tv_show (
              title,
              start_date
            ),
            appearance_date
          )
        `)
        .order('first_name', { ascending: true });

      if (personalitiesError) {
        throw new Error(`Failed to fetch personalities: ${personalitiesError.message}`);
      }

      if (!personalities || personalities.length === 0) {
        return {
          success: true,
          data: []
        };
      }

      // Get all folders from the personalities storage bucket
      const { data: folders, error: storageError } = await supabaseAdmin.storage
        .from('personalities')
        .list('', {
          limit: 1000,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (storageError) {
        console.warn('Could not access storage bucket:', storageError.message);
        // Return personalities without avatar info if storage fails
        return {
          success: true,
          data: personalities.map(p => ({
            personality_id: p.personality_id,
            first_name: p.first_name,
            last_name: p.last_name,
            has_avatar: false,
            shows: this.extractShowInfo(p.appearance),
            ...(this.getLatestShow(p.appearance) && { latest_show: this.getLatestShow(p.appearance) })
          }))
        };
      }

      // Create a Set of personality IDs that have avatar folders
      const avatarFolders = new Set(
        folders?.filter(folder => folder.name && folder.name !== '.emptyFolderPlaceholder')
          .map(folder => folder.name) || []
      );

      // Check each folder for avatar.webp file (batch operation)
      const avatarChecks = await Promise.allSettled(
        Array.from(avatarFolders).map(async (folderId) => {
          try {
            const { data: files } = await supabaseAdmin.storage
              .from('personalities')
              .list(folderId, {
                limit: 1,
                search: 'avatar.webp'
              });
            
            return {
              personality_id: folderId,
              has_avatar: !!(files && files.some(file => file.name === 'avatar.webp'))
            };
          } catch (error) {
            return {
              personality_id: folderId,
              has_avatar: false
            };
          }
        })
      );

      // Create a map of personality_id -> has_avatar
      const avatarMap = new Map<string, boolean>();
      avatarChecks.forEach(result => {
        if (result.status === 'fulfilled') {
          avatarMap.set(result.value.personality_id, result.value.has_avatar);
        }
      });

      // Combine personality data with avatar information and show data
      const personalitiesWithAvatars = personalities.map(personality => ({
        personality_id: personality.personality_id,
        first_name: personality.first_name,
        last_name: personality.last_name,
        has_avatar: avatarMap.get(personality.personality_id) || false,
        shows: this.extractShowInfo(personality.appearance),
        ...(this.getLatestShow(personality.appearance) && { latest_show: this.getLatestShow(personality.appearance) })
      }));

      return {
        success: true,
        data: personalitiesWithAvatars
      };
    } catch (error) {
      console.error('Error in getPersonalitiesWithAvatars:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Helper method to extract show information
  private extractShowInfo(appearances: any[]): string[] {
    if (!appearances || appearances.length === 0) return [];
    
    const shows = appearances
      .filter(app => app.tv_show && app.tv_show.title)
      .map(app => {
        const show = app.tv_show;
        const year = show.start_date ? new Date(show.start_date).getFullYear() : '';
        return year ? `${show.title} (${year})` : show.title;
      });
    
    // Remove duplicates and return
    return [...new Set(shows)];
  }

  // Helper method to get the latest/most recent show
  private getLatestShow(appearances: any[]): string | undefined {
    if (!appearances || appearances.length === 0) return undefined;
    
    // Sort by appearance_date or show start_date, most recent first
    const sortedAppearances = appearances
      .filter(app => app.tv_show && app.tv_show.title)
      .sort((a, b) => {
        const dateA = new Date(a.appearance_date || a.tv_show.start_date || '1900-01-01');
        const dateB = new Date(b.appearance_date || b.tv_show.start_date || '1900-01-01');
        return dateB.getTime() - dateA.getTime();
      });
    
    if (sortedAppearances.length === 0) return undefined;
    
    const latestShow = sortedAppearances[0].tv_show;
    const year = latestShow.start_date ? new Date(latestShow.start_date).getFullYear() : '';
    return year ? `${latestShow.title} (${year})` : latestShow.title;
  }
} 