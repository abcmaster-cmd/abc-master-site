'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CustomerUser {
  name: string;
  email: string;
  cpf: string;
  phone?: string;
}

interface UserContextType {
  user: CustomerUser | null;
  loading: boolean;
  loginClient: (email: string, cpfOrPassword: string) => Promise<{ success: boolean; message?: string }>;
  registerClient: (userData: CustomerUser) => Promise<{ success: boolean; message?: string }>;
  logoutClient: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Inicializa lendo a sessão ativa e os usuários padrão do mock
  useEffect(() => {
    try {
      const activeSession = localStorage.getItem('abc_customer_session');
      if (activeSession) {
        setUser(JSON.parse(activeSession));
      }

      // Inicializa alguns clientes registrados padrão caso a lista esteja vazia
      const registered = localStorage.getItem('abc_registered_customers');
      if (!registered) {
        const defaultCustomers = [
          {
            name: 'Marcio Silva',
            email: 'marcio@teste.com',
            cpf: '123.456.789-00',
            phone: '(11) 98888-8888'
          },
          {
            name: 'Ana Souza',
            email: 'ana@teste.com',
            cpf: '987.654.321-11',
            phone: '(11) 97777-7777'
          }
        ];
        localStorage.setItem('abc_registered_customers', JSON.stringify(defaultCustomers));

        // Registra também compras fictícias iniciais para esses usuários padrão conseguirem avaliar
        const localOrders = localStorage.getItem('abc_orders');
        if (!localOrders) {
          const defaultOrders = [
            {
              email: 'marcio@teste.com',
              cpf: '123.456.789-00',
              products: ['saco-pe-50x70', 'sacos-zip-n10'],
              date: new Date().toISOString()
            },
            {
              email: 'ana@teste.com',
              cpf: '987.654.321-11',
              products: ['sacos-zip-n4', 'saco-pe-grosso-60x80'],
              date: new Date().toISOString()
            }
          ];
          localStorage.setItem('abc_orders', JSON.stringify(defaultOrders));
        }
      }
    } catch (err) {
      console.error('Erro ao ler dados de sessão local:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Login de Cliente
  const loginClient = async (email: string, cpfOrPassword: string) => {
    try {
      const registered = JSON.parse(localStorage.getItem('abc_registered_customers') || '[]');
      
      // Valida se existe usuário com o e-mail informado
      const found = registered.find((c: CustomerUser) => 
        c.email.toLowerCase().trim() === email.toLowerCase().trim()
      );

      if (!found) {
        return { success: false, message: 'Usuário não encontrado. Crie uma conta abaixo!' };
      }

      // Validação simples: compara e-mail com CPF/Senha
      const cleanInputCpf = cpfOrPassword.replace(/\D/g, '');
      const cleanUserCpf = found.cpf.replace(/\D/g, '');
      
      // Permite logar usando o CPF/CNPJ como "senha" ou se digitar senha simulada
      if (cleanInputCpf !== cleanUserCpf && cpfOrPassword !== '123456') {
        return { success: false, message: 'Identificação incorreta. Digite seu CPF como senha ou use a senha padrão (123456).' };
      }

      // Salva sessão ativa
      localStorage.setItem('abc_customer_session', JSON.stringify(found));
      setUser(found);
      return { success: true };
    } catch (err) {
      return { success: false, message: 'Erro ao efetuar login. Tente novamente.' };
    }
  };

  // Cadastro de Cliente
  const registerClient = async (userData: CustomerUser) => {
    try {
      const registered = JSON.parse(localStorage.getItem('abc_registered_customers') || '[]');
      
      // Verifica duplicidade
      const exists = registered.some((c: CustomerUser) => 
        c.email.toLowerCase().trim() === userData.email.toLowerCase().trim() ||
        c.cpf.replace(/\D/g, '') === userData.cpf.replace(/\D/g, '')
      );

      if (exists) {
        return { success: false, message: 'E-mail ou CPF/CNPJ já cadastrado em outra conta.' };
      }

      // Adiciona na lista
      registered.push(userData);
      localStorage.setItem('abc_registered_customers', JSON.stringify(registered));

      // Efetua login automático
      localStorage.setItem('abc_customer_session', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (err) {
      return { success: false, message: 'Erro ao efetuar cadastro. Tente novamente.' };
    }
  };

  // Logout de Cliente
  const logoutClient = () => {
    localStorage.removeItem('abc_customer_session');
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, loading, loginClient, registerClient, logoutClient }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }
  return context;
}
