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
} 