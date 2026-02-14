
export const getMockWeather = (date: string) => {
  // Simple deterministic randomization based on date
  const day = new Date(date).getDate();
  const conditions = ['Clear', 'Partly Cloudy', 'Overcast', 'Light Rain'];
  
  return {
    temp: 65 + (day % 15), // 65-80
    condition: conditions[day % conditions.length],
    precip_prob: (day % 10) * 10 // 0-90%
  };
};
