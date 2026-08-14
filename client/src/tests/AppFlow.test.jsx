import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CartProvider, useCart } from '../context/CartContext';
import MenuPage from '../pages/MenuPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import { BrowserRouter } from 'react-router-dom';
import * as api from '../services/api';

// Mock the API service layer
vi.mock('../services/api', () => ({
  getMenu: vi.fn(),
  placeOrder: vi.fn(),
  getOrder: vi.fn(),
}));

const mockMenuData = [
  {
    id: 'e6a84d41-381a-4c28-971c-439564f26038',
    name: 'Margherita Pizza',
    description: 'Fresh cheese pizza',
    price: 12.50,
    imageUrl: 'http://example.com/pizza.jpg',
    isAvailable: true,
  },
  {
    id: 'f7b94d41-381a-4c28-971c-439564f26039',
    name: 'Vegan Buddha Bowl',
    description: 'Healthy vegan bowl',
    price: 10.00,
    imageUrl: 'http://example.com/bowl.jpg',
    isAvailable: true,
  },
];

const renderWithProviders = (ui) => {
  return render(
    <CartProvider>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </CartProvider>
  );
};

describe('Frontend React Flow Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders menu items and supports adding to cart', async () => {
    api.getMenu.mockResolvedValue(mockMenuData);

    renderWithProviders(<MenuPage />);

    expect(screen.getByText(/premium menu/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Margherita Pizza')).toBeInTheDocument();
      expect(screen.getByText('Vegan Buddha Bowl')).toBeInTheDocument();
    });

    const addButtons = screen.getAllByRole('button', { name: /add to cart/i });
    expect(addButtons.length).toBe(2);

    // Add to cart
    fireEvent.click(addButtons[0]);

    // Added feedback is rendered
    await waitFor(() => {
      expect(screen.getByText('Added')).toBeInTheDocument();
    });
  });

  it('calculates totals, changes quantity and removes items in the Cart', () => {
    const TestCartWrapper = () => {
      const { addToCart } = useCart();
      return (
        <div>
          <button onClick={() => addToCart(mockMenuData[0])}>Add Pizza</button>
          <button onClick={() => addToCart(mockMenuData[1])}>Add Bowl</button>
          <CartPage />
        </div>
      );
    };

    renderWithProviders(<TestCartWrapper />);

    // Click custom helpers to add items
    fireEvent.click(screen.getByText('Add Pizza'));
    fireEvent.click(screen.getByText('Add Bowl'));

    expect(screen.getByText('Margherita Pizza')).toBeInTheDocument();
    expect(screen.getByText('Vegan Buddha Bowl')).toBeInTheDocument();

    // Combined subtotal should equal 22.50
    expect(screen.getAllByText('$22.50').length).toBeGreaterThan(0);

    // Increase Pizza quantity
    const incButtons = screen.getAllByRole('button', { name: /increase quantity/i });
    fireEvent.click(incButtons[0]);

    // Pizza = 2 * 12.50 = 25.00, Bowl = 10.00. Total = 35.00
    expect(screen.getAllByText('$35.00').length).toBeGreaterThan(0);

    // Remove Pizza
    const removeButtons = screen.getAllByRole('button', { name: /remove item/i });
    fireEvent.click(removeButtons[0]);

    // Bowl = 10.00. Total = 10.00
    expect(screen.getAllByText('$10.00').length).toBeGreaterThan(0);
    expect(screen.queryByText('Margherita Pizza')).not.toBeInTheDocument();
  });

  it('validates checkout inputs and submits orders successfully', async () => {
    api.placeOrder.mockResolvedValue({
      id: 'order-123',
      orderNumber: 'ORD-12345',
      status: 'RECEIVED',
    });

    const TestCheckoutWrapper = () => {
      const { addToCart } = useCart();
      React.useEffect(() => {
        addToCart(mockMenuData[0]);
      }, []);
      return <CheckoutPage />;
    };

    renderWithProviders(<TestCheckoutWrapper />);

    const nameInput = screen.getByLabelText(/full name/i);
    const addressInput = screen.getByLabelText(/delivery address/i);
    const phoneInput = screen.getByLabelText(/phone number/i);
    const submitBtn = screen.getByRole('button', { name: /place order/i });

    // Submit empty form to trigger error messages
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/address must be at least 5 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/invalid phone number format/i)).toBeInTheDocument();
    });

    // Populate inputs with correct formats
    fireEvent.change(nameInput, { target: { value: 'Sarah Connor' } });
    fireEvent.change(addressInput, { target: { value: '742 Evergreen Terrace' } });
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.placeOrder).toHaveBeenCalledWith({
        customerName: 'Sarah Connor',
        address: '742 Evergreen Terrace',
        phone: '1234567890',
        items: [{ menuItemId: mockMenuData[0].id, quantity: 1 }],
      });
    });
  });
});
