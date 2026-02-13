'use client';

import { useState } from 'react';
import { User, Bell, Shield, Accessibility, Users, Moon, Sun } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

export function SettingsView() {
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [fontSize, setFontSize] = useState([16]);
  const [highContrast, setHighContrast] = useState(false);
  const [screenReader, setScreenReader] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Personalize sua experiência e configure preferências
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <div className="w-full overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 scrollbar-hide">
          <TabsList className="w-full justify-start sm:grid sm:grid-cols-5 h-auto p-1 gap-1">
            <TabsTrigger value="profile" className="flex-1 min-w-[100px] sm:min-w-0">Perfil</TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1 min-w-[100px] sm:min-w-0">Notificações</TabsTrigger>
            <TabsTrigger value="security" className="flex-1 min-w-[100px] sm:min-w-0">Segurança</TabsTrigger>
            <TabsTrigger value="accessibility" className="flex-1 min-w-[110px] sm:min-w-0">Acessibilidade</TabsTrigger>
            <TabsTrigger value="caregivers" className="flex-1 min-w-[100px] sm:min-w-0">Cuidadores</TabsTrigger>
          </TabsList>
        </div>

        {/* Perfil */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <User className="h-5 w-5 shrink-0" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>
                Atualize suas informações de perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" defaultValue="Maria Silva" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" defaultValue="maria.silva@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" type="tel" defaultValue="(11) 98765-4321" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthdate">Data de Nascimento</Label>
                <Input id="birthdate" type="date" defaultValue="1960-05-15" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  <div>
                    <Label>Modo Escuro</Label>
                    <p className="text-sm text-muted-foreground">
                      Ativar tema escuro para reduzir cansaço visual
                    </p>
                  </div>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
              <Button className="w-full min-h-[44px]">Salvar Alterações</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificações */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Bell className="h-5 w-5 shrink-0" />
                Preferências de Notificações
              </CardTitle>
              <CardDescription>
                Configure como e quando receber lembretes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificações Push</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber alertas no dispositivo
                  </p>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Som de Notificação</Label>
                  <p className="text-sm text-muted-foreground">
                    Reproduzir som ao receber lembrete
                  </p>
                </div>
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                  disabled={!notificationsEnabled}
                />
              </div>

              <div className="space-y-2">
                <Label>Tom de Notificação</Label>
                <Select defaultValue="default" disabled={!soundEnabled || !notificationsEnabled}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Padrão</SelectItem>
                    <SelectItem value="gentle">Suave</SelectItem>
                    <SelectItem value="alert">Alerta</SelectItem>
                    <SelectItem value="chime">Carrilhão</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Vibração</Label>
                  <p className="text-sm text-muted-foreground">
                    Vibrar ao receber lembrete
                  </p>
                </div>
                <Switch
                  checked={vibrationEnabled}
                  onCheckedChange={setVibrationEnabled}
                  disabled={!notificationsEnabled}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Antecedência do Lembrete</Label>
                <Select defaultValue="0">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No horário exato</SelectItem>
                    <SelectItem value="5">5 minutos antes</SelectItem>
                    <SelectItem value="10">10 minutos antes</SelectItem>
                    <SelectItem value="15">15 minutos antes</SelectItem>
                    <SelectItem value="30">30 minutos antes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Repetir Lembrete</Label>
                <Select defaultValue="none">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não repetir</SelectItem>
                    <SelectItem value="5">A cada 5 minutos</SelectItem>
                    <SelectItem value="10">A cada 10 minutos</SelectItem>
                    <SelectItem value="15">A cada 15 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segurança */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Shield className="h-5 w-5 shrink-0" />
                Segurança e Privacidade
              </CardTitle>
              <CardDescription>
                Proteja sua conta e seus dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Alterar Senha</h3>
                <div className="space-y-2">
                  <Label htmlFor="current-password">Senha Atual</Label>
                  <Input id="current-password" type="password" className="min-h-[44px]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <Input id="new-password" type="password" className="min-h-[44px]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                  <Input id="confirm-password" type="password" className="min-h-[44px]" />
                </div>
                <Button className="min-h-[44px]">Alterar Senha</Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Autenticação em Dois Fatores</Label>
                  <p className="text-sm text-muted-foreground">
                    Adicionar camada extra de segurança
                  </p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Backup Automático</Label>
                  <p className="text-sm text-muted-foreground">
                    Fazer backup dos dados automaticamente
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <Label>Frequência de Backup</Label>
                <Select defaultValue="daily">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diariamente</SelectItem>
                    <SelectItem value="weekly">Semanalmente</SelectItem>
                    <SelectItem value="monthly">Mensalmente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold text-red-600">Zona de Perigo</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full min-h-[44px]">
                    Exportar Todos os Dados
                  </Button>
                  <Button variant="destructive" className="w-full min-h-[44px]">
                    Excluir Conta
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Acessibilidade */}
        <TabsContent value="accessibility" className="space-y-4">
          <Card>
            <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Accessibility className="h-5 w-5 shrink-0" />
                Opções de Acessibilidade
              </CardTitle>
              <CardDescription>
                Configure recursos para melhor experiência
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="space-y-4">
                <Label>Tamanho da Fonte</Label>
                <div className="flex items-center gap-4">
                  <span className="text-sm">Pequeno</span>
                  <Slider
                    value={fontSize}
                    onValueChange={setFontSize}
                    min={12}
                    max={24}
                    step={2}
                    className="flex-1"
                  />
                  <span className="text-sm">Grande</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Tamanho atual: {fontSize}px
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Alto Contraste</Label>
                  <p className="text-sm text-muted-foreground">
                    Aumentar contraste para melhor legibilidade
                  </p>
                </div>
                <Switch checked={highContrast} onCheckedChange={setHighContrast} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Suporte a Leitor de Tela</Label>
                  <p className="text-sm text-muted-foreground">
                    Otimizar interface para leitores de tela
                  </p>
                </div>
                <Switch checked={screenReader} onCheckedChange={setScreenReader} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Animações Reduzidas</Label>
                  <p className="text-sm text-muted-foreground">
                    Minimizar efeitos de movimento
                  </p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Comandos por Voz</Label>
                <Select defaultValue="off">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">Desativado</SelectItem>
                    <SelectItem value="basic">Básico</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Controle o aplicativo usando comandos de voz
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cuidadores */}
        <TabsContent value="caregivers" className="space-y-4">
          <Card>
            <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Users className="h-5 w-5 shrink-0" />
                Gerenciar Cuidadores
              </CardTitle>
              <CardDescription>
                Permita que familiares e cuidadores acompanhem suas medicações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="flex items-center justify-between min-h-[44px]">
                <div className="pr-4">
                  <Label className="text-base">Monitoramento Remoto</Label>
                  <p className="text-sm text-muted-foreground">
                    Permitir que cuidadores vejam seu histórico
                  </p>
                </div>
                <Switch defaultChecked className="scale-125 sm:scale-100" />
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-4 text-base">Cuidadores Autorizados</h3>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border gap-3">
                    <div>
                      <p className="font-medium text-base">João Silva</p>
                      <p className="text-sm text-muted-foreground">joao.silva@email.com</p>
                      <p className="text-xs text-muted-foreground mt-1">Filho • Adicionado em 15/01/2026</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto min-h-[40px]">
                      Remover
                    </Button>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border gap-3">
                    <div>
                      <p className="font-medium text-base">Ana Costa</p>
                      <p className="text-sm text-muted-foreground">ana.costa@email.com</p>
                      <p className="text-xs text-muted-foreground mt-1">Cuidadora • Adicionada em 20/01/2026</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto min-h-[40px]">
                      Remover
                    </Button>
                  </div>
                </div>
              </div>

              <Button className="w-full min-h-[44px]">+ Adicionar Cuidador</Button>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold text-base">Configurações de Notificação para Cuidadores</h3>
                
                <div className="flex items-center justify-between min-h-[44px]">
                  <div className="pr-4">
                    <Label className="text-base">Alertar sobre Doses Perdidas</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar cuidadores quando uma dose for perdida
                    </p>
                  </div>
                  <Switch defaultChecked className="scale-125 sm:scale-100" />
                </div>

                <div className="flex items-center justify-between min-h-[44px]">
                  <div className="pr-4">
                    <Label className="text-base">Relatórios Semanais</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar resumo semanal para cuidadores
                    </p>
                  </div>
                  <Switch defaultChecked className="scale-125 sm:scale-100" />
                </div>

                <div className="flex items-center justify-between min-h-[44px]">
                  <div className="pr-4">
                    <Label className="text-base">Alertas de Estoque Baixo</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar quando medicamentos precisarem ser repostos
                    </p>
                  </div>
                  <Switch defaultChecked className="scale-125 sm:scale-100" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
