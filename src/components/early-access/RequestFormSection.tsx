import React, { useState } from 'react';
import * as Toast from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import { submitEarlyAccessRequest } from '../../api/early-access';

const RequestFormSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    linkedin: '',
    agency: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Toast state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastConfig, setToastConfig] = useState({
    title: '',
    description: '',
    type: 'success' as 'success' | 'error' | 'info'
  });

  const showToast = (title: string, description: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastConfig({ title, description, type });
    setToastOpen(false); // Force close first
    setTimeout(() => setToastOpen(true), 50); // Then open
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      if (!formData.name.trim()) {
        throw new Error('Please enter your name');
      }

      // Enviar al backend
      await submitEarlyAccessRequest({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        linkedin: formData.linkedin.trim() || undefined,
        agency: formData.agency.trim() || undefined
      });

      // Mostrar toast de éxito
      showToast(
        'Request submitted',
        "We'll review your request and get back to you soon.",
        'success'
      );

      // Resetear formulario
      setFormData({
        name: '',
        email: '',
        linkedin: '',
        agency: ''
      });

    } catch (error: any) {
      console.error('Error submitting request:', error);
      
      // Manejar específicamente el error 409 (email duplicado)
      const errorMessage = error.message || '';
      
      if (errorMessage.includes('already exists') || 
          errorMessage.includes('A request with this email') ||
          errorMessage.includes('409')) {
        
        showToast(
          'Request already submitted',
          "We already have your request. We'll contact you soon.",
          'info'
        );
        
        // También resetear el formulario en este caso
        setFormData({
          name: '',
          email: '',
          linkedin: '',
          agency: ''
        });
        
      } else {
        // Otros errores
        showToast(
          'Error submitting request',
          errorMessage || 'Please try again later.',
          'error'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Toast.Provider swipeDirection="right">
      <section id="request-form" className="py-24 px-6 bg-[#FAFAFA]">
        <div className="max-w-md mx-auto">
          <p className="text-sm font-medium tracking-[0.125em] uppercase text-muted-foreground mb-6 text-center">
            Request early access
          </p>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="name">
                Name <span className="text-destructive">*</span>
              </label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                id="name"
                name="name"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">
                Email <span className="text-destructive">*</span>
              </label>
              <input
                type="email"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                id="email"
                name="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="linkedin">
                LinkedIn profile (optional)
              </label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                id="linkedin"
                name="linkedin"
                placeholder="https://linkedin.com/in/yourprofile"
                value={formData.linkedin}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="agency">
                Agency (optional)
              </label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                id="agency"
                name="agency"
                placeholder="Your agency name"
                value={formData.agency}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
            <button
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-[#000000] text-[#FFFFFF] hover:bg-[#000000]/90 h-10 px-4 w-full text-base py-[14px] rounded-md shadow-none disabled:bg-gray-400 disabled:cursor-not-allowed"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                'Request early access'
              )}
            </button>
          </form>
          <p className="text-sm text-muted-foreground text-center mt-6">
            Villanet is currently available by invitation only.
          </p>
        </div>
      </section>

      {/* Toast Component - Exact replica del HTML */}
      <Toast.Root
        className="group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full border bg-background text-foreground"
        open={toastOpen}
        onOpenChange={setToastOpen}
        duration={5000}
      >
        <div className="grid gap-1">
          <Toast.Title className="text-sm font-semibold">
            {toastConfig.title}
          </Toast.Title>
          <Toast.Description className="text-sm opacity-90">
            {toastConfig.description}
          </Toast.Description>
        </div>
        <Toast.Close className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2">
          <X className="h-4 w-4" />
        </Toast.Close>
      </Toast.Root>

      {/* Toast Viewport - Posicionamiento responsive */}
      <Toast.Viewport className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]" />
    </Toast.Provider>
  );
};

export default RequestFormSection;