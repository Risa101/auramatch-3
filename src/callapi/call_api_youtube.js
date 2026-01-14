import api from "../api/axios";

export const getYoutubeVideos = async () => {
  const res = await api.get("/youtube");
  return res.data;
};
