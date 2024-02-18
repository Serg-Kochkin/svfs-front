export const useApi = (baseUrl) => {
  const fetchData = async (path, options = {}) => {
    try {
      const response = await fetch(`${baseUrl}${path}`, options);
      if (!response.ok) throw new Error(response.statusText);
      return await response.json();
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  };

  return { fetchData };
};
