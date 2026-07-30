export const getLevelInfo = (points) => {
  const pts = points || 0;
  
  if (pts < 20) {
    return { level: 1, name: 'Tân binh', badge: '🌱', next: 20 };
  } else if (pts < 50) {
    return { level: 2, name: 'Người khám phá', badge: '🔍', next: 50 };
  } else if (pts < 100) {
    return { level: 3, name: 'Chuyên gia', badge: '💡', next: 100 };
  } else {
    return { level: 4, name: 'Bậc thầy', badge: '👑', next: null };
  }
};
