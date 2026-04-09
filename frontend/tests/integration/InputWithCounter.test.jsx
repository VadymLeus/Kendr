import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import InputWithCounter from '../../src/shared/ui/complex/InputWithCounter';

describe('InputWithCounter (Integration)', () => {
    it('рендерить інпут з початковим лічильником (0 / customLimit)', () => {
        render(<InputWithCounter label="Тестовий інпут" customLimit={50} />);
        expect(screen.getByText('Тестовий інпут')).toBeInTheDocument();
        expect(screen.getByText('0 / 50')).toBeInTheDocument();
    });

    it('оновлює значення та лічильник при введенні тексту користувачем', () => {
        render(<InputWithCounter customLimit={20} placeholder="Введіть текст..." />);
        const inputElement = screen.getByPlaceholderText('Введіть текст...');
        fireEvent.change(inputElement, { target: { value: 'Hello' } });
        expect(inputElement.value).toBe('Hello');
        expect(screen.getByText('5 / 20')).toBeInTheDocument();
    });

    it('показує кнопку очищення і скидає текст при кліку на неї', () => {
        render(<InputWithCounter value="Початковий текст" customLimit={30} />);
        expect(screen.getByText('16 / 30')).toBeInTheDocument();
        const clearButton = screen.getByTitle('Очистити');
        expect(clearButton).toBeInTheDocument();
        fireEvent.click(clearButton);
        expect(screen.getByText('0 / 30')).toBeInTheDocument();
    });
});