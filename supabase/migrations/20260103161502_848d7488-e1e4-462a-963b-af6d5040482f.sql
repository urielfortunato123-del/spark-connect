-- Enum para roles de usuário
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Enum para planos disponíveis
CREATE TYPE public.app_plan AS ENUM ('free', 'telecom', 'ev', 'governo', 'pro');

-- Enum para módulos do sistema
CREATE TYPE public.app_module AS ENUM ('torres_5g', 'eletropostos', 'viabilidade', 'ambiental', 'cenarios', 'relatorios', 'ia_assistant');

-- Tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  company TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de roles (separada para segurança)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Tabela de planos do usuário
CREATE TABLE public.user_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan app_plan NOT NULL DEFAULT 'free',
  modules_enabled app_module[] NOT NULL DEFAULT '{}',
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de configuração de módulos por plano (referência)
CREATE TABLE public.plan_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan app_plan NOT NULL UNIQUE,
  modules app_module[] NOT NULL,
  description TEXT
);

-- Inserir configuração padrão de módulos por plano
INSERT INTO public.plan_modules (plan, modules, description) VALUES
  ('free', '{}', 'Acesso gratuito básico - visualização apenas'),
  ('telecom', '{torres_5g,cenarios,relatorios,ia_assistant}', 'Plano Telecom - Torres 5G + Cenários + Relatórios'),
  ('ev', '{eletropostos,viabilidade,relatorios,ia_assistant}', 'Plano EV - Eletropostos + Viabilidade + Relatórios'),
  ('governo', '{viabilidade,ambiental,relatorios,ia_assistant}', 'Plano Governo - Viabilidade + Ambiental + Relatórios'),
  ('pro', '{torres_5g,eletropostos,viabilidade,ambiental,cenarios,relatorios,ia_assistant}', 'Plano Pro - Acesso completo');

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_modules ENABLE ROW LEVEL SECURITY;

-- Função para verificar role (SECURITY DEFINER para evitar recursão)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Função para verificar se usuário tem acesso a módulo
CREATE OR REPLACE FUNCTION public.has_module_access(_user_id UUID, _module app_module)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_plans
    WHERE user_id = _user_id 
    AND _module = ANY(modules_enabled)
    AND (valid_until IS NULL OR valid_until > now())
  )
$$;

-- Função para obter plano do usuário
CREATE OR REPLACE FUNCTION public.get_user_plan(_user_id UUID)
RETURNS app_plan
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT plan FROM public.user_plans WHERE user_id = _user_id),
    'free'::app_plan
  )
$$;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Políticas RLS para user_roles (apenas admins podem gerenciar)
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Políticas RLS para user_plans
CREATE POLICY "Users can view their own plan"
ON public.user_plans FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all plans"
ON public.user_plans FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Políticas RLS para plan_modules (todos podem ler)
CREATE POLICY "Anyone can view plan modules"
ON public.plan_modules FOR SELECT
USING (true);

-- Trigger para criar profile e plano automaticamente ao criar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Criar profile
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  -- Criar role padrão
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Criar plano gratuito
  INSERT INTO public.user_plans (user_id, plan, modules_enabled)
  VALUES (NEW.id, 'free', '{}');
  
  RETURN NEW;
END;
$$;

-- Trigger para novos usuários
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_plans_updated_at
  BEFORE UPDATE ON public.user_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();