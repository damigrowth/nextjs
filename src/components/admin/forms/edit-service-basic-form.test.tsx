import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { EditServiceBasicForm } from './edit-service-basic-form';
import * as serviceActions from '@/actions/admin/services';

// Mock the server actions
vi.mock('@/actions/admin/services');

// Mock next/navigation
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('EditServiceBasicForm', () => {
  const mockService = {
    id: 1,
    title: 'Test Service',
    description: 'This is a test service description that is long enough to pass validation requirements.',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with initial values', () => {
    render(<EditServiceBasicForm service={mockService} />);

    expect(screen.getByLabelText(/title/i)).toHaveValue('Test Service');
    expect(screen.getByLabelText(/description/i)).toHaveValue(
      'This is a test service description that is long enough to pass validation requirements.'
    );
  });

  it('shows character count for title', () => {
    render(<EditServiceBasicForm service={mockService} />);

    const characterCount = screen.getByText(/12\/100 characters/i);
    expect(characterCount).toBeInTheDocument();
  });

  it('shows character count for description', () => {
    render(<EditServiceBasicForm service={mockService} />);

    const characterCount = screen.getByText(/87\/5000 characters/i);
    expect(characterCount).toBeInTheDocument();
  });

  it('validates title length - too short', async () => {
    const user = userEvent.setup();
    render(<EditServiceBasicForm service={mockService} />);

    const titleInput = screen.getByLabelText(/title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'AB');
    await user.tab(); // Trigger blur

    await waitFor(() => {
      expect(screen.getByText(/title must be at least 3 characters/i)).toBeInTheDocument();
    });
  });

  it('validates description length - too short', async () => {
    const user = userEvent.setup();
    render(<EditServiceBasicForm service={mockService} />);

    const descriptionInput = screen.getByLabelText(/description/i);
    await user.clear(descriptionInput);
    await user.type(descriptionInput, 'Short desc');
    await user.tab(); // Trigger blur

    await waitFor(() => {
      expect(screen.getByText(/description must be at least 80 characters/i)).toBeInTheDocument();
    });
  });

  it('disables submit button when form is invalid', async () => {
    const user = userEvent.setup();
    render(<EditServiceBasicForm service={mockService} />);

    const titleInput = screen.getByLabelText(/title/i);
    await user.clear(titleInput);

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    expect(submitButton).toBeDisabled();
  });

  it('disables submit button when form is not dirty', () => {
    render(<EditServiceBasicForm service={mockService} />);

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when form is valid and dirty', async () => {
    const user = userEvent.setup();
    render(<EditServiceBasicForm service={mockService} />);

    const titleInput = screen.getByLabelText(/title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Service Title');

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('calls updateServiceBasicAction with correct data on submit', async () => {
    const user = userEvent.setup();
    const mockUpdateServiceBasicAction = vi.mocked(serviceActions.updateServiceBasicAction);
    mockUpdateServiceBasicAction.mockResolvedValue({
      success: true,
      data: {
        id: 1,
        title: 'Updated Service Title',
        description: 'This is a test service description that is long enough to pass validation requirements.',
        profile: { id: '1', displayName: 'Test', username: 'test', uid: '1' }
      } as any
    });

    render(<EditServiceBasicForm service={mockService} />);

    const titleInput = screen.getByLabelText(/title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Service Title');

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateServiceBasicAction).toHaveBeenCalled();
    });
  });

  it('shows success toast and refreshes router on successful update', async () => {
    const user = userEvent.setup();
    const mockUpdateServiceBasicAction = vi.mocked(serviceActions.updateServiceBasicAction);
    mockUpdateServiceBasicAction.mockResolvedValue({
      success: true,
      data: {
        id: 1,
        title: 'Updated Service Title',
        description: 'This is a test service description that is long enough to pass validation requirements.',
        profile: { id: '1', displayName: 'Test', username: 'test', uid: '1' }
      } as any
    });

    const { toast } = await import('sonner');

    render(<EditServiceBasicForm service={mockService} />);

    const titleInput = screen.getByLabelText(/title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Service Title');

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Service updated successfully');
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it('shows error toast on failed update', async () => {
    const user = userEvent.setup();
    const mockUpdateServiceBasicAction = vi.mocked(serviceActions.updateServiceBasicAction);
    mockUpdateServiceBasicAction.mockResolvedValue({
      success: false,
      error: 'Failed to update service'
    });

    const { toast } = await import('sonner');

    render(<EditServiceBasicForm service={mockService} />);

    const titleInput = screen.getByLabelText(/title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Service Title');

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to update service');
    });
  });

  it('resets form to initial values when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<EditServiceBasicForm service={mockService} />);

    const titleInput = screen.getByLabelText(/title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Changed Title');

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(titleInput).toHaveValue('Test Service');
    });
  });
});
