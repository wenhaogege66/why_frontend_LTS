import axios from 'axios';

const API_BASE_URL = 'http://10.214.241.127:8000';

// 创建axios实例
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器：添加token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器：处理错误
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // token过期或无效，清除token并跳转到登录页
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// 定义请求/响应数据类型
interface LoginParams {
    email: string;
    password: string;
    code?: number;
}

interface LoginResponse {
    token: string;
    user_id: string;
    message?: string;
    code?: number;
}

interface RegisterParams {
    nickname: string;
    email: string;
    password: string;
    code?: number;
}

interface RegisterResponse {
    code: number;
    message: string;
}

interface ChangePasswordParams {
    password: string;
    code?: number;
}

interface ChangePasswordResponse{
    code?: number;
    message?: string;
}

interface UpdateProfileParams {
    nickname?: string;  // 可选昵称
    avatar_url?: string; // 可选头像
}

interface UpdateProfileResponse {
    code?: number;
    message?: string;
}


// 错误处理函数
const handleError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
        console.error('API Error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Network error');
    } else {
        console.error('Unexpected Error:', error);
        throw new Error('An unexpected error occurred');
    }
};

// 用户登录接口
export const login = async (params: LoginParams): Promise<LoginResponse> => {
    try {
        const response = await api.post('/api/user/login/', params);
        if (response.data.data?.token) {
            localStorage.setItem('token', response.data.data.token);
        }
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};

// 用户注册接口
export const register = async (params: RegisterParams): Promise<RegisterResponse> => {
    try {
        const response = await api.post('/api/user/register/', params);
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};

// 获取用户信息接口
export const getProfile = async () => {
    try {
        const response = await api.get('/api/user/profile/');
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};

// 用户修改个人信息接口
export const updateProfile = async (params: UpdateProfileParams): Promise<UpdateProfileResponse> => {
    try {
        const response = await api.put('/user/update/profile', params, {
            headers: {
                'Content-Type': 'application/json',
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
    localStorage.removeItem('token');
};

// 用户修改密码接口
export const changePassword = async (params: ChangePasswordParams): Promise<ChangePasswordResponse> => {
    try {
        const formData = new FormData();
        formData.append('password', params.password);

        const response = await api.put('/user/update/password', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
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