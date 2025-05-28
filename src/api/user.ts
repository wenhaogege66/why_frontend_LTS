import api, { axios } from './axiosConfig';

// 定义请求/响应数据类型
interface LoginParams {
  email: string;
  password: string;
  code?: number;
}

interface LoginResponse {
  token: string;
  user_id: string;
  message: string;
  code?: number;
}

interface RegisterParams {
  nickname: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  code: number;
  message: string;
}

interface ChangePasswordParams {
  password: string;
  new_password: string;
}

interface ChangePasswordResponse {
  code: number;
  message: string;
}

interface UpdateProfileParams {
  nickname?: string; // 可选昵称
  avatar_url?: string; // 可选头像
}

interface UpdateProfileResponse {
  code?: number;
  message: string;
}

// 错误处理函数
const handleError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    console.error("API Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Network error");
  }
  throw error;
};

// 用户登录接口
export const login = async (params: LoginParams): Promise<LoginResponse> => {
  try {
    const response = await api.post("/api/user/login/", params);
    if (response.data.data?.token) {
      localStorage.setItem("token", response.data.data.token);
    }
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// 用户注册接口
export const register = async (
  params: RegisterParams
): Promise<RegisterResponse> => {
  try {
    const response = await api.post("/api/user/register/", params);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// 获取用户信息接口
export const getProfile = async () => {
  try {
    const response = await api.get("/api/user/profile/");
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// 用户修改个人信息接口
export const updateProfile = async (
  params: UpdateProfileParams
): Promise<UpdateProfileResponse> => {
  try {
    const response = await api.put("api/user/update/", params, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// 用户退出接口
export const logout = () => {
  localStorage.removeItem("token");
};

// 用户修改密码接口
export const changePassword = async (
  params: ChangePasswordParams
): Promise<ChangePasswordResponse> => {
  try {
    const response = await api.put("api/user/update/password/", params, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// 导出所有接口
export const userApi = {
  login,
  register,
  logout,
  changePassword,
  getProfile,
  updateProfile,
};
