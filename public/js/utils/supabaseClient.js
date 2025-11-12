/**
 * ===================================
 * BRAINCORE - SUPABASE CLIENT
 * ===================================
 * Cliente centralizado de Supabase con funciones auxiliares
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { SUPABASE_CONFIG } from './constants.js';

// Crear instancia única del cliente
const supabaseClient = createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'braincore-web-app',
    },
  },
});

/**
 * SupabaseService - Clase para gestionar operaciones con Supabase
 */
class SupabaseService {
  constructor() {
    this.client = supabaseClient;
    this.currentUser = null;
  }

  // ===================================
  // AUTHENTICATION METHODS
  // ===================================

  /**
   * Obtener el usuario actual
   * @returns {Promise<{user: Object|null, error: Error|null}>}
   */
  async getCurrentUser() {
    try {
      const {
        data: { user },
        error,
      } = await this.client.auth.getUser();

      if (error) {
        throw new Error(error.message);
      }

      this.currentUser = user;
      return { user, error: null };
    } catch (error) {
      console.error('Error getting current user:', error);
      return { user: null, error };
    }
  }

  /**
   * Registrar nuevo usuario
   * @param {Object} credentials - {email, password}
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async signUp({ email, password, metadata = {} }) {
    try {
      const { data, error } = await this.client.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth.html`,
          data: metadata,
        },
      });

      if (error) throw new Error(error.message);

      return { data, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { data: null, error };
    }
  }

  /**
   * Iniciar sesión
   * @param {Object} credentials - {email, password}
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async signIn({ email, password }) {
    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new Error(error.message);

      this.currentUser = data.user;
      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { data: null, error };
    }
  }

  /**
   * Cerrar sesión
   * @returns {Promise<{error: Error|null}>}
   */
  async signOut() {
    try {
      const { error } = await this.client.auth.signOut();

      if (error) throw new Error(error.message);

      this.currentUser = null;
      localStorage.clear();

      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error };
    }
  }

  /**
   * Recuperar contraseña
   * @param {string} email
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async resetPassword(email) {
    try {
      const { data, error } = await this.client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth.html?reset=true`,
      });

      if (error) throw new Error(error.message);

      return { data, error: null };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { data: null, error };
    }
  }

  /**
   * Actualizar contraseña
   * @param {string} newPassword
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async updatePassword(newPassword) {
    try {
      const { data, error } = await this.client.auth.updateUser({
        password: newPassword,
      });

      if (error) throw new Error(error.message);

      return { data, error: null };
    } catch (error) {
      console.error('Error updating password:', error);
      return { data: null, error };
    }
  }

  /**
   * Verificar si hay sesión activa
   * @returns {Promise<boolean>}
   */
  async hasActiveSession() {
    const { user } = await this.getCurrentUser();
    return !!user;
  }

  // ===================================
  // DATABASE METHODS
  // ===================================

  /**
   * Obtener perfil del usuario
   * @param {string} userId
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async getProfile(userId) {
    try {
      const { data, error } = await this.client
        .from(SUPABASE_CONFIG.TABLES.PROFILES)
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw new Error(error.message);

      return { data, error: null };
    } catch (error) {
      console.error('Error getting profile:', error);
      return { data: null, error };
    }
  }

  /**
   * Actualizar perfil del usuario
   * @param {string} userId
   * @param {Object} updates
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async updateProfile(userId, updates) {
    try {
      const { data, error } = await this.client
        .from(SUPABASE_CONFIG.TABLES.PROFILES)
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw new Error(error.message);

      return { data, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtener suscripción activa del usuario
   * @param {string} companyId
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async getActiveSubscription(companyId) {
    try {
      const { data, error } = await this.client
        .from(SUPABASE_CONFIG.TABLES.SUBSCRIPTIONS)
        .select('*')
        .eq('company_id', companyId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(error.message);
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error getting subscription:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtener llamadas con paginación
   * @param {Object} options - {companyId, page, limit, search}
   * @returns {Promise<{data: Array, count: number, error: Error|null}>}
   */
  async getCalls({ companyId, page = 1, limit = 10, search = '' }) {
    try {
      const offset = (page - 1) * limit;

      let query = this.client
        .from(SUPABASE_CONFIG.TABLES.CALLS)
        .select('*', { count: 'exact' })
        .eq('client_id', companyId)
        .order('call_timestamp', { ascending: false })
        .range(offset, offset + limit - 1);

      if (search) {
        query = query.or(
          `name.ilike.%${search}%,phone.ilike.%${search}%,service.ilike.%${search}%`
        );
      }

      const { data, count, error } = await query;

      if (error) throw new Error(error.message);

      return { data: data || [], count: count || 0, error: null };
    } catch (error) {
      console.error('Error getting calls:', error);
      return { data: [], count: 0, error };
    }
  }

  /**
   * Obtener detalles de una llamada
   * @param {string} callId
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async getCall(callId) {
    try {
      const { data, error } = await this.client
        .from(SUPABASE_CONFIG.TABLES.CALLS)
        .select('*')
        .eq('id', callId)
        .single();

      if (error) throw new Error(error.message);

      return { data, error: null };
    } catch (error) {
      console.error('Error getting call:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtener estadísticas de llamadas
   * @param {string} companyId
   * @param {Object} dateRange - {start, end}
   * @returns {Promise<{data: Object, error: Error|null}>}
   */
  async getCallStats(companyId, dateRange = null) {
    try {
      let query = this.client
        .from(SUPABASE_CONFIG.TABLES.CALLS)
        .select('duration_seconds, call_timestamp', { count: 'exact' })
        .eq('client_id', companyId);

      if (dateRange) {
        query = query.gte('call_timestamp', dateRange.start).lte('call_timestamp', dateRange.end);
      }

      const { data, count, error } = await query;

      if (error) throw new Error(error.message);

      const totalDuration = data?.reduce((sum, call) => sum + (call.duration_seconds || 0), 0) || 0;
      const avgDuration = count > 0 ? Math.round(totalDuration / count) : 0;

      return {
        data: {
          totalCalls: count || 0,
          totalDuration,
          avgDuration,
        },
        error: null,
      };
    } catch (error) {
      console.error('Error getting call stats:', error);
      return {
        data: {
          totalCalls: 0,
          totalDuration: 0,
          avgDuration: 0,
        },
        error,
      };
    }
  }

  /**
   * Obtener configuración del agente
   * @param {string} companyId
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async getAgentConfig(companyId) {
    try {
      const { data, error } = await this.client
        .from(SUPABASE_CONFIG.TABLES.AGENT_CONFIGS)
        .select('*')
        .eq('company_id', companyId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(error.message);
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error getting agent config:', error);
      return { data: null, error };
    }
  }

  /**
   * Guardar configuración del agente
   * @param {Object} config
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async saveAgentConfig(config) {
    try {
      const { data, error } = await this.client
        .from(SUPABASE_CONFIG.TABLES.AGENT_CONFIGS)
        .upsert(config, {
          onConflict: 'company_id',
          ignoreDuplicates: false,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      return { data, error: null };
    } catch (error) {
      console.error('Error saving agent config:', error);
      return { data: null, error };
    }
  }

  // ===================================
  // REALTIME METHODS
  // ===================================

  /**
   * Suscribirse a cambios en tiempo real
   * @param {string} table - Nombre de la tabla
   * @param {Function} callback - Función a ejecutar cuando hay cambios
   * @param {Object} filter - Filtros opcionales
   * @returns {Object} - Canal de suscripción
   */
  subscribeToChanges(table, callback, filter = {}) {
    try {
      const channel = this.client
        .channel(`${table}_changes`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table,
            ...filter,
          },
          callback
        )
        .subscribe();

      return channel;
    } catch (error) {
      console.error('Error subscribing to changes:', error);
      return null;
    }
  }

  /**
   * Cancelar suscripción
   * @param {Object} channel - Canal a cancelar
   */
  unsubscribe(channel) {
    if (channel) {
      this.client.removeChannel(channel);
    }
  }

  // ===================================
  // STORAGE METHODS
  // ===================================

  /**
   * Subir archivo
   * @param {string} bucket - Nombre del bucket
   * @param {string} path - Ruta del archivo
   * @param {File} file - Archivo a subir
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async uploadFile(bucket, path, file) {
    try {
      const { data, error } = await this.client.storage.from(bucket).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (error) throw new Error(error.message);

      return { data, error: null };
    } catch (error) {
      console.error('Error uploading file:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtener URL pública de un archivo
   * @param {string} bucket - Nombre del bucket
   * @param {string} path - Ruta del archivo
   * @returns {string|null}
   */
  getPublicUrl(bucket, path) {
    try {
      const { data } = this.client.storage.from(bucket).getPublicUrl(path);

      return data.publicUrl;
    } catch (error) {
      console.error('Error getting public URL:', error);
      return null;
    }
  }
}

// Crear y exportar instancia única
const supabaseService = new SupabaseService();

// Exportar tanto el cliente como el servicio
export { supabaseClient as supabase, supabaseService };
export default supabaseService;
