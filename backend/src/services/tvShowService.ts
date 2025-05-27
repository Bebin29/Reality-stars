import { supabaseClient, supabaseAdmin } from '@/config/database';
import {
  TvShow,
  CreateTvShowRequest,
  TvShowQueryParams,
  PaginatedResponse,
  ApiResponse
} from '@/types/database';

export class TvShowService {
  // Get all TV shows with pagination and filtering
  async getTvShows(params: TvShowQueryParams): Promise<PaginatedResponse<TvShow[]>> {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        network_id,
        genre_id,
        year,
        sort_by = 'created_at',
        sort_order = 'desc'
      } = params;

      const offset = (page - 1) * limit;

      let query = supabaseClient
        .from('tv_show')
        .select(`
          *,
          network (*),
          tv_show_genre (
            genre (*)
          )
        `, { count: 'exact' });

      // Apply filters
      if (search) {
        query = query.ilike('title', `%${search}%`);
      }

      if (network_id) {
        query = query.eq('network_id', network_id);
      }

      if (year) {
        query = query.gte('start_date', `${year}-01-01`)
                   .lte('start_date', `${year}-12-31`);
      }

      // Genre filtering - we'll handle this differently
      if (genre_id) {
        // Get show IDs that have this genre
        const { data: genreShows } = await supabaseClient
          .from('tv_show_genre')
          .select('show_id')
          .eq('genre_id', genre_id);
        
        const showIds = genreShows?.map(gs => gs.show_id) || [];
        if (showIds.length > 0) {
          query = query.in('show_id', showIds);
        } else {
          // No shows found for this genre
          return {
            success: true,
            data: [],
            pagination: { page, limit, total: 0, totalPages: 0 }
          };
        }
      }

      // Apply sorting
      query = query.order(sort_by, { ascending: sort_order === 'asc' });

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to fetch TV shows: ${error.message}`);
      }

      // Transform the data to include genres properly
      const transformedData = data?.map(show => ({
        ...show,
        genres: show.tv_show_genre?.map((tsg: { genre: unknown }) => tsg.genre).filter(Boolean) || []
      })) || [];

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        success: true,
        data: transformedData,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages
        }
      };
    } catch (error) {
      console.error('Error in getTvShows:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Get TV show by ID with related data
  async getTvShowById(id: string): Promise<ApiResponse<TvShow>> {
    try {
      const { data, error } = await supabaseClient
        .from('tv_show')
        .select(`
          *,
          network (*),
          tv_show_genre (
            genre (*)
          ),
          season (
            *,
            episode (*)
          ),
          appearance (
            *,
            personality (*)
          )
        `)
        .eq('show_id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: 'TV show not found'
          };
        }
        throw new Error(`Failed to fetch TV show: ${error.message}`);
      }

      // Transform the data
      const transformedData = {
        ...data,
        genres: data.tv_show_genre?.map((tsg: { genre: unknown }) => tsg.genre).filter(Boolean) || []
      };

      return {
        success: true,
        data: transformedData
      };
    } catch (error) {
      console.error('Error in getTvShowById:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Create new TV show
  async createTvShow(showData: CreateTvShowRequest): Promise<ApiResponse<TvShow>> {
    try {
      const { genre_ids, ...tvShowData } = showData;

      // Create the TV show first
      const { data: show, error: showError } = await supabaseAdmin
        .from('tv_show')
        .insert([{
          ...tvShowData,
          start_date: tvShowData.start_date ? new Date(tvShowData.start_date) : null,
          end_date: tvShowData.end_date ? new Date(tvShowData.end_date) : null
        }])
        .select()
        .single();

      if (showError) {
        throw new Error(`Failed to create TV show: ${showError.message}`);
      }

      // Add genre associations if provided
      if (genre_ids && genre_ids.length > 0) {
        const genreAssociations = genre_ids.map(genre_id => ({
          show_id: show.show_id,
          genre_id
        }));

        const { error: genreError } = await supabaseAdmin
          .from('tv_show_genre')
          .insert(genreAssociations);

        if (genreError) {
          console.error('Failed to associate genres:', genreError);
          // Don't fail the entire operation, just log the error
        }
      }

      return {
        success: true,
        data: show,
        message: 'TV show created successfully'
      };
    } catch (error) {
      console.error('Error in createTvShow:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Update TV show
  async updateTvShow(id: string, updates: Partial<CreateTvShowRequest>): Promise<ApiResponse<TvShow>> {
    try {
      const { genre_ids, ...updateData } = updates;

      const tvShowUpdate = {
        ...updateData,
        start_date: updateData.start_date ? new Date(updateData.start_date) : undefined,
        end_date: updateData.end_date ? new Date(updateData.end_date) : undefined,
        updated_at: new Date()
      };

      const { data, error } = await supabaseAdmin
        .from('tv_show')
        .update(tvShowUpdate)
        .eq('show_id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: 'TV show not found'
          };
        }
        throw new Error(`Failed to update TV show: ${error.message}`);
      }

      // Update genre associations if provided
      if (genre_ids !== undefined) {
        // Remove existing associations
        await supabaseAdmin
          .from('tv_show_genre')
          .delete()
          .eq('show_id', id);

        // Add new associations
        if (genre_ids.length > 0) {
          const genreAssociations = genre_ids.map(genre_id => ({
            show_id: id,
            genre_id
          }));

          await supabaseAdmin
            .from('tv_show_genre')
            .insert(genreAssociations);
        }
      }

      return {
        success: true,
        data,
        message: 'TV show updated successfully'
      };
    } catch (error) {
      console.error('Error in updateTvShow:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Delete TV show
  async deleteTvShow(id: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabaseAdmin
        .from('tv_show')
        .delete()
        .eq('show_id', id);

      if (error) {
        throw new Error(`Failed to delete TV show: ${error.message}`);
      }

      return {
        success: true,
        data: null,
        message: 'TV show deleted successfully'
      };
    } catch (error) {
      console.error('Error in deleteTvShow:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Search TV shows by title
  async searchTvShows(searchTerm: string, limit: number = 10): Promise<ApiResponse<unknown[]>> {
    try {
      const { data, error } = await supabaseClient
        .from('tv_show')
        .select(`
          show_id,
          title,
          start_date,
          network (name)
        `)
        .ilike('title', `%${searchTerm}%`)
        .limit(limit);

      if (error) {
        throw new Error(`Failed to search TV shows: ${error.message}`);
      }

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Error in searchTvShows:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Get TV shows by network
  async getTvShowsByNetwork(networkId: string): Promise<ApiResponse<TvShow[]>> {
    try {
      const { data, error } = await supabaseClient
        .from('tv_show')
        .select(`
          *,
          network (*)
        `)
        .eq('network_id', networkId);

      if (error) {
        throw new Error(`Failed to fetch TV shows by network: ${error.message}`);
      }

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Error in getTvShowsByNetwork:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Get TV shows by genre
  async getTvShowsByGenre(genreId: string): Promise<ApiResponse<TvShow[]>> {
    try {
      const { data, error } = await supabaseClient
        .from('tv_show_genre')
        .select(`
          tv_show (
            *,
            network (*)
          )
        `)
        .eq('genre_id', genreId);

      if (error) {
        throw new Error(`Failed to fetch TV shows by genre: ${error.message}`);
      }

      const shows = data?.map((item: unknown) => (item as { tv_show: TvShow }).tv_show).filter(Boolean) as TvShow[] || [];

      return {
        success: true,
        data: shows
      };
    } catch (error) {
      console.error('Error in getTvShowsByGenre:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
} 