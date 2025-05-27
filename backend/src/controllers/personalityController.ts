import { Request, Response } from 'express';
import { PersonalityService } from '@/services/personalityService';
import { PersonalityQueryParams, CreatePersonalityRequest } from '@/types/database';
import Joi from 'joi';

const personalityService = new PersonalityService();

// Validation schemas
const createPersonalitySchema = Joi.object({
  first_name: Joi.string().min(1).max(100).required(),
  last_name: Joi.string().min(1).max(100).required(),
  birth_date: Joi.date().iso().optional(),
  birth_place: Joi.string().max(255).optional(),
  nationality: Joi.string().max(100).optional(),
  gender: Joi.string().valid('männlich', 'weiblich', 'divers').optional(),
  bio: Joi.string().optional(),
  profile_image: Joi.string().uri().optional()
});

const updatePersonalitySchema = Joi.object({
  first_name: Joi.string().min(1).max(100).optional(),
  last_name: Joi.string().min(1).max(100).optional(),
  birth_date: Joi.date().iso().optional(),
  birth_place: Joi.string().max(255).optional(),
  nationality: Joi.string().max(100).optional(),
  gender: Joi.string().valid('männlich', 'weiblich', 'divers').optional(),
  bio: Joi.string().optional(),
  profile_image: Joi.string().uri().optional()
});

const queryParamsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().optional(),
  gender: Joi.string().valid('männlich', 'weiblich', 'divers').optional(),
  nationality: Joi.string().optional(),
  sort_by: Joi.string().valid('first_name', 'last_name', 'birth_date', 'created_at').default('created_at'),
  sort_order: Joi.string().valid('asc', 'desc').default('desc')
});

export class PersonalityController {
  // GET /api/personalities
  async getPersonalities(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = queryParamsSchema.validate(req.query);
      
      if (error) {
        res.status(400).json({
          success: false,
          error: error.details[0]?.message || 'Invalid query parameters'
        });
        return;
      }

      const result = await personalityService.getPersonalities(value as PersonalityQueryParams);
      
      if (!result.success) {
        res.status(500).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getPersonalities controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // GET /api/personalities/:id
  async getPersonalityById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Personality ID is required'
        });
        return;
      }

      const result = await personalityService.getPersonalityById(id);
      
      if (!result.success) {
        const statusCode = result.error === 'Personality not found' ? 404 : 500;
        res.status(statusCode).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getPersonalityById controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // POST /api/personalities
  async createPersonality(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = createPersonalitySchema.validate(req.body);
      
      if (error) {
        res.status(400).json({
          success: false,
          error: error.details[0]?.message || 'Invalid input data'
        });
        return;
      }

      const result = await personalityService.createPersonality(value as CreatePersonalityRequest);
      
      if (!result.success) {
        res.status(500).json(result);
        return;
      }

      res.status(201).json(result);
    } catch (error) {
      console.error('Error in createPersonality controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // PUT /api/personalities/:id
  async updatePersonality(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Personality ID is required'
        });
        return;
      }

      const { error, value } = updatePersonalitySchema.validate(req.body);
      
      if (error) {
        res.status(400).json({
          success: false,
          error: error.details[0]?.message || 'Invalid input data'
        });
        return;
      }

      const result = await personalityService.updatePersonality(id, value);
      
      if (!result.success) {
        const statusCode = result.error === 'Personality not found' ? 404 : 500;
        res.status(statusCode).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in updatePersonality controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // DELETE /api/personalities/:id
  async deletePersonality(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Personality ID is required'
        });
        return;
      }

      const result = await personalityService.deletePersonality(id);
      
      if (!result.success) {
        res.status(500).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in deletePersonality controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // GET /api/personalities/search?q=searchTerm
  async searchPersonalities(req: Request, res: Response): Promise<void> {
    try {
      const { q: searchTerm, limit } = req.query;

      if (!searchTerm || typeof searchTerm !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Search term is required'
        });
        return;
      }

      const searchLimit = limit ? parseInt(limit as string, 10) : 10;
      
      if (isNaN(searchLimit) || searchLimit < 1 || searchLimit > 50) {
        res.status(400).json({
          success: false,
          error: 'Limit must be a number between 1 and 50'
        });
        return;
      }

      const result = await personalityService.searchPersonalities(searchTerm, searchLimit);
      
      if (!result.success) {
        res.status(500).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in searchPersonalities controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // GET /api/personalities/by-show/:showId
  async getPersonalitiesByShow(req: Request, res: Response): Promise<void> {
    try {
      const { showId } = req.params;

      if (!showId) {
        res.status(400).json({
          success: false,
          error: 'Show ID is required'
        });
        return;
      }

      const result = await personalityService.getPersonalitiesByShow(showId);
      
      if (!result.success) {
        res.status(500).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getPersonalitiesByShow controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
} 