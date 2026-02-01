import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api/client'

type FavoritesContextType = {
  favorites: number[]
  toggleFavorite: (jobId: number) => void
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const [favorites, setFavorites] = useState<number[]>([])
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) {
      setFavorites([]);
      return;
    }

    // Cargamos favoritos al iniciar o refrescar
    api.get('/favorites')
      .then(res => {
        // 1. Manejamos diferentes estructuras de respuesta del backend
        const rawData = Array.isArray(res.data) 
          ? res.data 
          : (res.data.favorites || []);

        // 2. NORMALIZACIÓN CRÍTICA: Convertimos todo a Number para que includes() funcione
        const favIds = rawData.map((f: any) => Number(f.job_id || f.id));
        
        console.log("Favoritos sincronizados (IDs):", favIds);
        setFavorites(favIds);
      })
      .catch((err) => {
        console.error("Error cargando favoritos:", err);
        setFavorites([]);
      });
  }, [token]);

  const toggleFavorite = async (jobId: number) => {
    if (!token) return;

    // Convertimos el ID a número por seguridad
    const numericId = Number(jobId);
    const isAlreadyFav = favorites.includes(numericId);

    try {
      if (isAlreadyFav) {
        // Eliminación optimista: actualizamos UI antes de la respuesta del servidor
        setFavorites(prev => prev.filter(id => id !== numericId));
        await api.delete('/favorites', { 
          data: { job_id: numericId } 
        });
      } else {
        // Adición optimista
        setFavorites(prev => [...prev, numericId]);
        await api.post('/favorites', { job_id: numericId });
      }
    } catch (err) {
      console.error("Error al toggle favorite:", err);
      // Si falla la API, revertimos el cambio visual para no mentir al usuario
      if (isAlreadyFav) {
        setFavorites(prev => [...prev, numericId]);
      } else {
        setFavorites(prev => prev.filter(id => id !== numericId));
      }
      alert("No se pudo guardar el favorito. Inténtalo de nuevo.");
    }
  }

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites debe usarse dentro de FavoritesProvider')
  return ctx
}