import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/tanstack-start'
import { apiMethods } from '@/lib/api'
import type { Profile } from '@/types'

export function useProfiles(sectionId: string) {
  const { userId, getToken } = useAuth()

  return useQuery({
    queryKey: ['profiles', sectionId],
    queryFn: async () => {
      if (!userId) return null
      const token = await getToken()
      if (!token) throw new Error('No token available')
      return apiMethods.profiles.getAll(sectionId, token)
    },
    enabled: !!userId,
  })
}

export function useProfile(sectionId: string, profileId: string | null) {
  const { userId, getToken } = useAuth()

  return useQuery({
    queryKey: ['profile', sectionId, profileId],
    queryFn: async () => {
      if (!userId || !profileId) return null
      const token = await getToken()
      if (!token) throw new Error('No token available')
      return apiMethods.profiles.get(profileId, token)
    },
    enabled: !!userId && !!profileId,
  })
}
