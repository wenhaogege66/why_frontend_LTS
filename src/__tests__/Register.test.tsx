import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import Register from '../pages/Register';
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

describe('注册页面测试', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderRegister = () => {
        return render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );
    };

    test('渲染注册表单', () => {
        renderRegister();
        expect(screen.getByText('WHY Music')).toBeInTheDocument();
        expect(screen.getByText('创建您的账号')).toBeInTheDocument();
        expect(screen.getByLabelText(/昵称/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/邮箱/i)).toBeInTheDocument();
        const passwordInputs = screen.getAllByLabelText(/密码/i);
        expect(passwordInputs[0]).toBeInTheDocument();
        expect(passwordInputs[1]).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /注册/i })).toBeInTheDocument();
    });

    test('表单验证 - 空字段', async () => {
        renderRegister();
        fireEvent.click(screen.getByRole('button', { name: /注册/i }));
        // 检查错误消息（根据实际UI提示调整）
        const errorMessage = await screen.findByText(/请填写所有必填字段/i);
        expect(errorMessage).toBeInTheDocument();
    });

    test('密码不匹配验证', async () => {
        renderRegister();
        fireEvent.change(screen.getByLabelText(/昵称/i), {
            target: { value: '测试用户' }
        });
        fireEvent.change(screen.getByLabelText(/邮箱/i), {
            target: { value: 'test@example.com' }
        });
        const passwordInputs = screen.getAllByLabelText(/密码/i);
        fireEvent.change(passwordInputs[0], {
            target: { value: 'password123' }
        });
        fireEvent.change(passwordInputs[1], {
            target: { value: 'password456' }
        });
        fireEvent.click(screen.getByRole('button', { name: /注册/i }));
        expect(await screen.findByText(/两次输入的密码不一致/i)).toBeInTheDocument();
    });

    test('注册成功流程', async () => {
        mockUserApi.register.mockResolvedValueOnce({
            code: 200,
            message: '注册成功'
        });

        renderRegister();

        fireEvent.change(screen.getByLabelText(/昵称/i), {
            target: { value: '测试用户' }
        });
        fireEvent.change(screen.getByLabelText(/邮箱/i), {
            target: { value: 'test@example.com' }
        });
        const passwordInputs = screen.getAllByLabelText(/密码/i);
        fireEvent.change(passwordInputs[0], {
            target: { value: 'Password123!' }
        });
        fireEvent.change(passwordInputs[1], {
            target: { value: 'Password123!' }
        });

        fireEvent.click(screen.getByRole('button', { name: /注册/i }));

        // 验证API调用
        await waitFor(() => {
            expect(mockUserApi.register).toHaveBeenCalledWith({
                nickname: '测试用户',
                email: 'test@example.com',
                password: 'Password123!',
                confirmPassword: 'Password123!'
            });
        }, { timeout: 3000 });

        // 验证成功消息
        await waitFor(() => {
            expect(screen.getByText(/注册成功！/i)).toBeInTheDocument();
        }, { timeout: 3000 });

        // 验证导航
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        }, { timeout: 3000 });
    });

    test('密码强度检测', () => {
        renderRegister();
        const passwordInputs = screen.getAllByLabelText(/密码/i);
        fireEvent.change(passwordInputs[0], {
            target: { value: '123' }
        });
        expect(screen.getByText(/密码强度: 弱/i)).toBeInTheDocument();
        fireEvent.change(passwordInputs[0], {
            target: { value: 'Password123' }
        });
        expect(screen.getByText(/密码强度: 中等/i)).toBeInTheDocument();
        fireEvent.change(passwordInputs[0], {
            target: { value: 'Password123!@#' }
        });
        expect(screen.getByText(/密码强度: 强/i)).toBeInTheDocument();
    });

    test('密码可见性切换', async () => {
        renderRegister();
        const passwordInputs = screen.getAllByLabelText(/密码/i);
        const toggleButtons = screen.getAllByTestId('VisibilityIcon').map(icon => icon.closest('button'));
        expect(passwordInputs[0]).toHaveAttribute('type', 'password');
        expect(passwordInputs[1]).toHaveAttribute('type', 'password');
        fireEvent.click(toggleButtons[0]!);
        await waitFor(() => {
            expect(passwordInputs[0]).toHaveAttribute('type', 'text');
        });
        fireEvent.click(toggleButtons[1]!);
        await waitFor(() => {
            expect(passwordInputs[1]).toHaveAttribute('type', 'text');
        });
    });

    test('表单验证', async () => {
        renderRegister();
        const submitButton = screen.getByRole('button', { name: /注册/i });
        fireEvent.click(submitButton);
        // 等待错误消息出现（根据实际UI提示调整）
        const errorMessage = await screen.findByText(/请填写所有必填字段/i);
        expect(errorMessage).toBeInTheDocument();
    });
}); 
