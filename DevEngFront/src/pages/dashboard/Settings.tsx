
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTheme } from "@/contexts/ThemeContext";
import { Check, Settings as SettingsIcon, Palette } from "lucide-react";
import { motion } from "framer-motion";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("appearance");

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Theme color samples
  const themeColors = {
    light: "#F8F9FC",
    dark: "#1A1F2C",
    pink: "#FFF5F7",
    blue: "#F0F7FF"
  };

  const ThemeOption = ({
    name,
    color,
    selected,
    onClick
  }: {
    name: string;
    color: string;
    selected: boolean;
    onClick: () => void;
  }) => {
    return (
      <motion.div 
        className={`theme-card ${selected ? "theme-card-selected" : ""}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        variants={item}
      >
        <div 
          className="w-24 h-24 rounded-xl mb-4 border border-border"
          style={{ backgroundColor: color }}
        />
        <div className="flex items-center gap-2">
          <span className="font-medium">{name}</span>
          {selected && <Check className="h-4 w-4 text-primary" />}
        </div>
      </motion.div>
    );
  };

  return (
    <DashboardLayout>
      <motion.div 
        className="max-w-5xl mx-auto p-4 md:p-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item}>
          <div className="flex items-center gap-3 mb-6">
            <SettingsIcon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-color font-ubuntu">Settings</h1>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full mb-6 glass-tabs-s ">
              <TabsTrigger value="appearance" className="glass-tabs-s flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Palette className="h-4 w-4 mr-2" /> Appearance
              </TabsTrigger>
              <TabsTrigger value="account" className="flex-1 data-[state=active]:bg-card data-[state=active]:shadow-sm">Account</TabsTrigger>
            </TabsList>

            <TabsContent value="appearance">
              <Card className="glass-tabs">
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>
                    Customize the look and feel of the application.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Theme</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <ThemeOption
                          name="Light"
                          color={themeColors.light}
                          selected={theme === "light"}
                          onClick={() => setTheme("light")}
                        />
                        <ThemeOption
                          name="Dark"
                          color={themeColors.dark}
                          selected={theme === "dark"}
                          onClick={() => setTheme("dark")}
                        />
                        <ThemeOption
                          name="Pink"
                          color={themeColors.pink}
                          selected={theme === "pink"}
                          onClick={() => setTheme("pink")}
                        />
                        <ThemeOption
                          name="Blue"
                          color={themeColors.blue}
                          selected={theme === "blue"}
                          onClick={() => setTheme("blue")}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Account</CardTitle>
                  <CardDescription>
                    Manage your account settings.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Account settings coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Settings;
