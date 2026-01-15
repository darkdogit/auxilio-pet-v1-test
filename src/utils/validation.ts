export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
};

export const validateFullName = (name: string): boolean => {
  return name.trim().length >= 3 && name.includes(' ');
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const formatPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');

  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  return phone;
};

export const validateFormData = (data: {
  nomeCompleto: string;
  email: string;
  whatsapp: string;
}): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!validateFullName(data.nomeCompleto)) {
    errors.nomeCompleto = 'Por favor, insira seu nome completo';
  }

  if (!validateEmail(data.email)) {
    errors.email = 'Por favor, insira um email válido';
  }

  if (!validatePhone(data.whatsapp)) {
    errors.whatsapp = 'Por favor, insira um número válido';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
