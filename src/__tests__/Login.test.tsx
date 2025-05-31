import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import Login from '../pages/Login';
import { mockUserApi } from '../setupTests';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
    const actual = jest.requireActual('react-router-dom') as any;
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

describe('登录页面测试', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderLogin = () => {
        return render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );
    };

    test('渲染登录表单', () => {
        renderLogin();
        expect(screen.getByText('欢迎来到')).toBeInTheDocument();
        expect(screen.getByText('WHY Music')).toBeInTheDocument();
        expect(screen.getByLabelText(/邮箱/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/密码/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /登录/i })).toBeInTheDocument();
    });

    test('表单验证 - 空字段', async () => {
        renderLogin();
        fireEvent.click(screen.getByRole('button', { name: /登录/i }));
        // 检查错误消息（根据实际UI提示调整）
        const errorMessage = await screen.findByText(/请输入邮箱和密码/i);
        expect(errorMessage).toBeInTheDocument();
    });

    test('登录成功流程', async () => {
        mockUserApi.login.mockResolvedValueOnce({
            token: 'test-token',
            user_id: 'test-user-id',
            message: '登录成功',
            code: 200
        });

        renderLogin();

        fireEvent.change(screen.getByLabelText(/邮箱/i), {
            target: { value: 'test@example.com' }
        });
        fireEvent.change(screen.getByLabelText(/密码/i), {
            target: { value: 'password123' }
        });

        fireEvent.click(screen.getByRole('button', { name: /登录/i }));

        // 验证API调用
        await waitFor(() => {
            expect(mockUserApi.login).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123'
            });
        }, { timeout: 3000 });

        // 验证成功消息
        await waitFor(() => {
            expect(screen.getByText(/登录成功！/i)).toBeInTheDocument();
        }, { timeout: 3000 });

        // 验证导航
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/');
        }, { timeout: 3000 });
    });

    test('登录失败流程', async () => {
        mockUserApi.login.mockRejectedValueOnce({
            response: {
                data: {
                    message: '邮箱或密码错误'
                }
            }
        });

        renderLogin();

        fireEvent.change(screen.getByLabelText(/邮箱/i), {
            target: { value: 'test@example.com' }
        });
        fireEvent.change(screen.getByLabelText(/密码/i), {
            target: { value: 'wrongpassword' }
        });

        fireEvent.click(screen.getByRole('button', { name: /登录/i }));

        // 验证错误消息（根据实际UI提示调整）
        await waitFor(() => {
            expect(screen.getByText(/邮箱或密码错误/i)).toBeInTheDocument();
        });
    });

    test('密码可见性切换', async () => {
        renderLogin();

        const passwordInput = screen.getByLabelText(/密码/i);
        const toggleButton = screen.getAllByTestId('VisibilityIcon')[0].closest('button');

        expect(passwordInput).toHaveAttribute('type', 'password');
        fireEvent.click(toggleButton!);
        await waitFor(() => {
            expect(passwordInput).toHaveAttribute('type', 'text');
        });
        fireEvent.click(toggleButton!);
        await waitFor(() => {
            expect(passwordInput).toHaveAttribute('type', 'password');
        });
    });
});
