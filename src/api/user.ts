import axios from 'axios';

// 定义基础请求配置
const api = axios.create({
    baseURL: 'http://localhost:5173/api', // 替换为你的后端API地址
    timeout: 10000, // 请求超时时间
});

// 定义请求/响应数据类型
interface LoginParams {
    email: string;
    password: string;
}

interface LoginResponse {
    token: string;
    user_id: string;
}

interface ChangePasswordParams {
    password: string;
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
        const response = await api.post('/user/login', params, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        handleError(error);
        throw error; // 继续抛出错误以便组件捕获
    }
};

// 用户退出接口
export const quit = async (): Promise<void> => {
    try {
        await api.post('/user/quit');
    } catch (error) {
        handleError(error);
    }
};

// 用户修改密码接口
export const changePassword = async (params: ChangePasswordParams): Promise<void> => {
    try {
        const formData = new FormData();
        formData.append('password', params.password);

        await api.put('/user/update/password', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    } catch (error) {
        handleError(error);
    }
};

// 导出所有接口
export const userApi = {
    login,
    quit,
    changePassword,
};