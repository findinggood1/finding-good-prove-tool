import type { InputHTMLAttributes, TextareaHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import React from 'react';

// =============================================================================
// BUTTON COMPONENT
// =============================================================================

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-fg-primary text-white hover:bg-fg-dark focus:ring-fg-primary disabled:bg-gray-400',
    secondary: 'bg-fg-secondary text-white hover:bg-fg-primary focus:ring-fg-secondary disabled:bg-gray-400',
    outline: 'border-2 border-fg-primary text-fg-primary hover:bg-fg-primary hover:text-white focus:ring-fg-primary disabled:border-gray-300 disabled:text-gray-400',
    ghost: 'text-fg-primary hover:bg-fg-light focus:ring-fg-primary disabled:text-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-gray-400'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${loading ? 'opacity-75 cursor-wait' : ''}
        ${disabled ? 'cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}

// =============================================================================
// CARD COMPONENT
// =============================================================================

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  className = '',
  variant = 'default',
  padding = 'md'
}: CardProps) {
  const variantClasses = {
    default: 'bg-white',
    elevated: 'bg-white shadow-lg',
    outlined: 'bg-white border border-gray-200'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={`rounded-xl ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
}

// =============================================================================
// INPUT COMPONENT
// =============================================================================

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-4 py-3 rounded-lg border transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-fg-primary focus:border-transparent
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
}

// =============================================================================
// TEXTAREA COMPONENT
// =============================================================================

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  maxLength?: number;
  showCount?: boolean;
}

export function Textarea({
  label,
  error,
  helperText,
  maxLength,
  showCount = false,
  className = '',
  id,
  value,
  ...props
}: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const charCount = typeof value === 'string' ? value.length : 0;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        value={value}
        maxLength={maxLength}
        className={`
          w-full px-4 py-3 rounded-lg border transition-colors duration-200 resize-none
          focus:outline-none focus:ring-2 focus:ring-fg-primary focus:border-transparent
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
          ${className}
        `}
        {...props}
      />
      <div className="flex justify-between mt-1">
        {error && <p className="text-sm text-red-600">{error}</p>}
        {helperText && !error && <p className="text-sm text-gray-500">{helperText}</p>}
        {showCount && maxLength && (
          <p className={`text-sm ml-auto ${charCount > maxLength * 0.9 ? 'text-amber-600' : 'text-gray-400'}`}>
            {charCount}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// SLIDER COMPONENT (for Pulse scores)
// =============================================================================

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  lowLabel?: string;
  highLabel?: string;
  showValue?: boolean;
}

export function Slider({
  value,
  onChange,
  min = 1,
  max = 5,
  step = 1,
  lowLabel,
  highLabel,
  showValue = true
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, #1B5666 0%, #1B5666 ${percentage}%, #E5E7EB ${percentage}%, #E5E7EB 100%)`
          }}
        />
        {showValue && (
          <div 
            className="absolute -top-8 transform -translate-x-1/2 bg-fg-primary text-white text-sm px-2 py-1 rounded"
            style={{ left: `${percentage}%` }}
          >
            {value}
          </div>
        )}
      </div>
      {(lowLabel || highLabel) && (
        <div className="flex justify-between mt-2 text-sm text-gray-500">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// BADGE COMPONENT
// =============================================================================

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  className?: string;
  style?: React.CSSProperties;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  style
}: BadgeProps) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm'
  };

  return (
    <span 
      className={`inline-flex items-center rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}

// =============================================================================
// LOADING SPINNER
// =============================================================================

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <svg
      className={`animate-spin ${sizeClasses[size]} text-fg-primary ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// =============================================================================
// PROGRESS BAR
// =============================================================================

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  size = 'md',
  className = ''
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className={className}>
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className="bg-fg-primary h-full rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-sm text-gray-500 mt-1 text-right">{Math.round(percentage)}%</p>
      )}
    </div>
  );
}

// =============================================================================
// PROGRESS DOTS (for question flow)
// =============================================================================

interface ProgressDotsProps {
  total: number;
  current: number;
  className?: string;
}

export function ProgressDots({ total, current, className = '' }: ProgressDotsProps) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full transition-all duration-200 ${
            i === current
              ? 'bg-fg-primary w-4'
              : i < current
              ? 'bg-fg-primary'
              : 'bg-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

// =============================================================================
// CONTAINER
// =============================================================================

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Container({ children, className = '', size = 'md' }: ContainerProps) {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className={`mx-auto px-4 w-full ${sizeClasses[size]} ${className}`}>
      {children}
    </div>
  );
}

// =============================================================================
// HEADER
// =============================================================================

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  className?: string;
}

export function Header({ title, subtitle, showLogo = true, className = '' }: HeaderProps) {
  return (
    <header className={`text-center py-6 ${className}`}>
      {showLogo && (
        <div className="text-fg-primary font-serif text-2xl font-bold mb-2">
          Finding Good
        </div>
      )}
      {title && (
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      )}
      {subtitle && (
        <p className="text-gray-600 mt-1">{subtitle}</p>
      )}
    </header>
  );
}

// =============================================================================
// ERROR MESSAGE
// =============================================================================

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({ message, onRetry, className = '' }: ErrorMessageProps) {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <div className="ml-3 flex-1">
          <p className="text-sm text-red-700">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// EMPTY STATE
// =============================================================================

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && (
        <div className="flex justify-center mb-4 text-gray-400">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      {description && (
        <p className="mt-1 text-gray-500">{description}</p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// QUESTION CARD
// =============================================================================

interface QuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  questionText: string;
  firesElement: string;
  firesColor: string;
  value: string;
  onChange: (value: string) => void;
  onBack?: () => void;
  onNext: () => void;
  isLastQuestion?: boolean;
  isLoading?: boolean;
}

export function QuestionCard({
  questionNumber,
  totalQuestions,
  questionText,
  firesElement,
  firesColor,
  value,
  onChange,
  onBack,
  onNext,
  isLastQuestion = false,
  isLoading = false
}: QuestionCardProps) {
  const minChars = 20;
  const maxChars = 500;
  const isValid = value.trim().length >= minChars;

  return (
    <Card variant="elevated" padding="lg" className="animate-fade-in">
      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        <ProgressDots total={totalQuestions} current={questionNumber - 1} />
        <Badge 
          variant="default"
          className="text-white"
          style={{ backgroundColor: firesColor } as React.CSSProperties}
        >
          {firesElement}
        </Badge>
      </div>

      {/* Question */}
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {questionText}
      </h2>

      {/* Answer */}
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Share your thoughts..."
        rows={5}
        maxLength={maxChars}
        showCount
        helperText={value.length < minChars ? `At least ${minChars} characters for a meaningful reflection` : undefined}
      />

      {/* Actions */}
      <div className="flex justify-between mt-6">
        {onBack ? (
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
        ) : (
          <div />
        )}
        <Button
          variant="primary"
          onClick={onNext}
          disabled={!isValid}
          loading={isLoading}
        >
          {isLastQuestion ? 'See My Results' : 'Continue'}
        </Button>
      </div>
    </Card>
  );
}

// =============================================================================
// FIRES ELEMENT SELECTOR
// =============================================================================

interface FIRESElementSelectorProps {
  selected: string[];
  onToggle: (element: string) => void;
  max?: number;
}

export function FIRESElementSelector({ selected, onToggle, max = 3 }: FIRESElementSelectorProps) {
  const elements = [
    { id: 'feelings', label: 'Feelings', color: '#E57373', description: 'Emotional signals' },
    { id: 'influence', label: 'Influence', color: '#64B5F6', description: 'Agency & control' },
    { id: 'resilience', label: 'Resilience', color: '#81C784', description: 'Handling difficulty' },
    { id: 'ethics', label: 'Ethics', color: '#FFD54F', description: 'Values & purpose' },
    { id: 'strengths', label: 'Strengths', color: '#BA68C8', description: 'Natural abilities' }
  ];

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500 mb-3">Select up to {max} areas to focus on (optional)</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {elements.map((el) => {
          const isSelected = selected.includes(el.id);
          const isDisabled = !isSelected && selected.length >= max;

          return (
            <button
              key={el.id}
              onClick={() => !isDisabled && onToggle(el.id)}
              disabled={isDisabled}
              className={`
                p-4 rounded-lg border-2 text-left transition-all duration-200
                ${isSelected
                  ? 'border-current shadow-sm'
                  : isDisabled
                  ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
              style={isSelected ? { borderColor: el.color, backgroundColor: `${el.color}10` } : undefined}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: el.color }}
                />
                <div>
                  <div className="font-medium text-gray-900">{el.label}</div>
                  <div className="text-sm text-gray-500">{el.description}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// TIMEFRAME SELECTOR
// =============================================================================

interface TimeframeSelectorProps {
  selected: string | null;
  onChange: (value: string) => void;
}

export function TimeframeSelector({ selected, onChange }: TimeframeSelectorProps) {
  const options = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`
            py-3 px-4 rounded-lg border-2 font-medium transition-all duration-200
            ${selected === opt.value
              ? 'border-fg-primary bg-fg-primary text-white'
              : 'border-gray-200 text-gray-600 hover:border-fg-secondary'
            }
          `}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// =============================================================================
// INTENSITY SELECTOR
// =============================================================================

interface IntensitySelectorProps {
  selected: string | null;
  onChange: (value: string) => void;
}

export function IntensitySelector({ selected, onChange }: IntensitySelectorProps) {
  const options = [
    { value: 'light', label: 'Light', description: 'Quick and easy' },
    { value: 'balanced', label: 'Balanced', description: 'Thoughtful depth' },
    { value: 'deeper', label: 'Deeper', description: 'More vulnerable' }
  ];

  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`
            w-full py-4 px-4 rounded-lg border-2 text-left transition-all duration-200
            ${selected === opt.value
              ? 'border-fg-primary bg-fg-light'
              : 'border-gray-200 hover:border-fg-secondary'
            }
          `}
        >
          <div className="font-medium text-gray-900">{opt.label}</div>
          <div className="text-sm text-gray-500">{opt.description}</div>
        </button>
      ))}
    </div>
  );
}

// =============================================================================
// INFO ICON (with tooltip on hover)
// =============================================================================

interface InfoIconProps {
  text: string;
  className?: string;
}

export function InfoIcon({ text, className = '' }: InfoIconProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="w-4 h-4 text-gray-400 hover:text-fg-primary transition-colors cursor-help focus:outline-none focus:text-fg-primary"
        aria-label="More information"
      >
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 sm:w-72 p-3 bg-gray-900 text-white text-xs rounded shadow-lg z-50">
          <div className="relative">
            {text}
            <svg className="absolute top-full left-1/2 transform -translate-x-1/2 text-gray-900" width="8" height="4" viewBox="0 0 8 4">
              <path fill="currentColor" d="M0 0l4 4 4-4z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
