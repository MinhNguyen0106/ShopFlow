import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MacTrafficLights } from '../mac-traffic-lights';

describe('MacTrafficLights Component', () => {
  it('renders all three traffic light buttons (close, minimize, maximize)', () => {
    render(<MacTrafficLights />);
    const closeBtn = screen.getByTitle('Đóng cửa sổ');
    const minBtn = screen.getByTitle('Thu nhỏ');
    const maxBtn = screen.getByTitle('Mở rộng toàn màn hình');

    expect(closeBtn).toBeInTheDocument();
    expect(minBtn).toBeInTheDocument();
    expect(maxBtn).toBeInTheDocument();
  });

  it('triggers callbacks when buttons are clicked', () => {
    const handleClose = vi.fn();
    const handleMinimize = vi.fn();
    const handleMaximize = vi.fn();

    render(
      <MacTrafficLights
        onClose={handleClose}
        onMinimize={handleMinimize}
        onMaximize={handleMaximize}
      />
    );

    fireEvent.click(screen.getByTitle('Đóng cửa sổ'));
    expect(handleClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTitle('Thu nhỏ'));
    expect(handleMinimize).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTitle('Mở rộng toàn màn hình'));
    expect(handleMaximize).toHaveBeenCalledTimes(1);
  });
});
