export const createMeetingRoom = async () => {
  const roomName = `skillswap-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  return `https://meet.jit.si/${roomName}`
}