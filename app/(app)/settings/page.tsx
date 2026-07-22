"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { LogOut, Camera, Key, Trash2, Download, ChevronRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SettingsSkeleton } from "@/components/skeletons/settings-skeleton";
import { useSkeletonLoading } from "@/hooks/use-skeleton-loading";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator as DialogSeparator } from "@/components/ui/separator";

interface SettingsPageProps {
  user?: {
    name: string;
    email: string;
    initials: string;
    plan: "FREE" | "PRO";
  };
}

export default function SettingsPage({ user }: SettingsPageProps) {
  const router = useRouter();
  const { isLoading, isExiting } = useSkeletonLoading(2000);
  const [activeTab, setActiveTab] = React.useState("profile");
  const [name, setName] = React.useState(user?.name || "Ankush S");
  const [email, setEmail] = React.useState(user?.email || "ankush@mybusiness.com");
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  // Notification settings
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [campaignAlerts, setCampaignAlerts] = React.useState(true);
  const [weeklyDigest, setWeeklyDigest] = React.useState(false);
  const [productUpdates, setProductUpdates] = React.useState(true);

  // Security
  const [twoFactor, setTwoFactor] = React.useState(false);
  const [authProvider, setAuthProvider] = React.useState<string>("email");
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");
  const [passwordSuccess, setPasswordSuccess] = React.useState(false);
  const [passwordLoading, setPasswordLoading] = React.useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const supabase = createClient();

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const provider = data.user?.app_metadata?.providers?.[0] ?? "email";
      setAuthProvider(provider);
    });
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handlePasswordChange = async () => {
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordLoading(false);

    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(false);
      }, 1500);
    }
  };

  if (isLoading) {
    return <div className={isExiting ? "skeleton-container-exit" : ""}><SettingsSkeleton /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      <div className="mb-8">
        <h1
          className="text-[24px] font-bold tracking-tight text-[var(--text)]"
          style={{ letterSpacing: "-0.025em" }}
        >
          Settings
        </h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1.5">
          Manage your account, preferences, and notifications
        </p>
      </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-[var(--bg-surface)] h-10 p-1 rounded-xl">
            <TabsTrigger value="profile" className="rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">Profile</TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">Notifications</TabsTrigger>
            <TabsTrigger value="security" className="rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">Security</TabsTrigger>
            <TabsTrigger value="data" className="rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">Data & Privacy</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6 mt-0">
            <Card className="udon-card-elevated border-0">
              <CardContent className="p-5">
                <div className="flex items-center gap-5">
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-2xl bg-[var(--bg-surface)] flex items-center justify-center text-2xl font-bold text-[var(--text)] overflow-hidden border-2 border-[var(--border)]">
                      <img
                        src="/udon-logo.png"
                        alt="Udon"
                        className="w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute inset-0"
                      />
                      <span className="group-hover:opacity-0 transition-opacity duration-200">
                        {user?.initials || "AS"}
                      </span>
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[16px] font-bold text-[var(--text)]">{user?.name || "Ankush S"}</h3>
                    <p className="text-[13px] text-[var(--text-secondary)]">{user?.email || "ankush@mybusiness.com"}</p>
                    <Badge variant="outline" className="text-xs border-[var(--border)] text-[var(--text-muted)] mt-1">
                      Free Plan
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="udon-card-elevated border-0">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-[14px] font-bold text-[var(--text)]">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Full Name</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="udon-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Email</label>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="udon-input"
                      type="email"
                    />
                  </div>
                </div>
                <Button onClick={handleSave} className="udon-btn-primary">
                  {saved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Saved
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="udon-card-elevated border-0">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-[14px] font-bold text-[var(--text)]">Billing & Plans</h3>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-surface)]">
                  <div>
                    <p className="text-[13px] font-medium text-[var(--text)]">Current Plan</p>
                    <p className="text-xs text-[var(--text-muted)]">Free — {5 - 3} of 5 monthly generations remaining</p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl border-[var(--border)] text-[var(--text)] text-xs" onClick={() => router.push("/billing")}>
                    Upgrade
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6 mt-0">
            <Card className="udon-card-elevated border-0">
              <CardContent className="p-5 space-y-5">
                <div>
                  <h3 className="text-[14px] font-bold text-[var(--text)] mb-1">Email Notifications</h3>
                  <p className="text-xs text-[var(--text-muted)]">Choose what emails you receive</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-medium text-[var(--text)]">Campaign Alerts</p>
                      <p className="text-xs text-[var(--text-muted)]">Get notified when campaigns finish generating</p>
                    </div>
                    <Switch checked={campaignAlerts} onCheckedChange={setCampaignAlerts} />
                  </div>
                  <Separator className="bg-[var(--border-light)]" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-medium text-[var(--text)]">Email Notifications</p>
                      <p className="text-xs text-[var(--text-muted)]">Receive general email updates</p>
                    </div>
                    <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                  </div>
                  <Separator className="bg-[var(--border-light)]" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-medium text-[var(--text)]">Weekly Digest</p>
                      <p className="text-xs text-[var(--text-muted)]">Summary of your campaign performance</p>
                    </div>
                    <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
                  </div>
                  <Separator className="bg-[var(--border-light)]" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-medium text-[var(--text)]">Product Updates</p>
                      <p className="text-xs text-[var(--text-muted)]">New features and improvements</p>
                    </div>
                    <Switch checked={productUpdates} onCheckedChange={setProductUpdates} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6 mt-0">
            <Card className="udon-card-elevated border-0">
              <CardContent className="p-5 space-y-5">
                <div>
                  <h3 className="text-[14px] font-bold text-[var(--text)] mb-1">Password</h3>
                  <p className="text-xs text-[var(--text-muted)]">Manage your password and authentication</p>
                </div>
                {authProvider === "google" ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      <div>
                        <p className="text-[13px] font-medium text-blue-800">Signed in with Google</p>
                        <p className="text-xs text-blue-600">Your password is managed through your Google account</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="udon-btn-secondary h-10"
                      onClick={() => window.open("https://myaccount.google.com/security", "_blank")}
                    >
                      <Key className="w-4 h-4 mr-2" />
                      Manage on Google
                      <svg className="w-3 h-3 ml-2 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" className="udon-btn-secondary h-10" onClick={() => setShowPasswordModal(true)}>
                    <Key className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="udon-card-elevated border-0">
              <CardContent className="p-5 space-y-5">
                <div>
                  <h3 className="text-[14px] font-bold text-[var(--text)] mb-1">Two-Factor Authentication</h3>
                  <p className="text-xs text-[var(--text-muted)]">Add an extra layer of security to your account</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-medium text-[var(--text)]">Enable 2FA</p>
                    <p className="text-xs text-[var(--text-muted)]">Require a verification code when signing in</p>
                  </div>
                  <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
                </div>
              </CardContent>
            </Card>

            <Card className="udon-card border-[var(--danger-light)]">
              <CardContent className="p-5 space-y-5">
                <div>
                  <h3 className="text-[14px] font-bold text-[var(--danger)] mb-1">Danger Zone</h3>
                  <p className="text-xs text-[var(--danger)]">Irreversible actions</p>
                </div>
                <Button
                  variant="outline"
                  className="udon-btn-secondary border-[var(--danger-light)] text-[var(--danger)] hover:bg-[var(--danger-light)] h-10"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data & Privacy Tab */}
          <TabsContent value="data" className="space-y-6 mt-0">
            <Card className="udon-card-elevated border-0">
              <CardContent className="p-5 space-y-5">
                <div>
                  <h3 className="text-[14px] font-bold text-[var(--text)] mb-1">Export Data</h3>
                  <p className="text-xs text-[var(--text-muted)]">Download a copy of all your data</p>
                </div>
                <Button variant="outline" className="udon-btn-secondary h-10">
                  <Download className="w-4 h-4 mr-2" />
                  Export All Data
                </Button>
              </CardContent>
            </Card>

            <Card className="udon-card-elevated border-0">
              <CardContent className="p-5 space-y-5">
                <div>
                  <h3 className="text-[14px] font-bold text-[var(--text)] mb-1">Privacy</h3>
                  <p className="text-xs text-[var(--text-muted)]">Control how your data is used</p>
                </div>
                <div className="space-y-3 text-[13px] text-[var(--text-secondary)]">
                  <p>Your data is encrypted at rest and in transit. We never sell your information to third parties.</p>
                  <p>Generated content and brand profiles are stored securely and only accessible by your account.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="udon-card-elevated border-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[14px] font-bold text-[var(--text)]">Sign Out</h3>
                    <p className="text-xs text-[var(--text-muted)]">Sign out of your account on this device</p>
                  </div>
                  <Button
                    variant="outline"
                    className="udon-btn-secondary h-10"
                    onClick={() => setShowSignOutConfirm(true)}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      {/* Delete Account Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-white border-[var(--border-default)] sm:max-w-md rounded-2xl shadow-[var(--shadow-xl)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--text)]">Delete Account?</DialogTitle>
            <DialogDescription className="text-[var(--text-secondary)]">
              This action is permanent and cannot be undone. All your data, campaigns, and brand profiles will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogSeparator className="bg-[var(--border-light)]" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="udon-btn-secondary">
              Cancel
            </Button>
            <Button
              className="udon-btn-primary bg-[var(--danger)] hover:opacity-90"
              onClick={() => {
                setShowDeleteConfirm(false);
                handleSignOut();
              }}
            >
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sign Out Modal */}
      <Dialog open={showSignOutConfirm} onOpenChange={setShowSignOutConfirm}>
        <DialogContent className="bg-white border-[var(--border-default)] sm:max-w-md rounded-2xl shadow-[var(--shadow-xl)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--text)]">Sign Out?</DialogTitle>
            <DialogDescription className="text-[var(--text-secondary)]">
              You will be signed out of your account and redirected to the login page.
            </DialogDescription>
          </DialogHeader>
          <DialogSeparator className="bg-[var(--border-light)]" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSignOutConfirm(false)} className="udon-btn-secondary">
              Cancel
            </Button>
            <Button className="udon-btn-primary" onClick={handleSignOut}>
              Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="bg-white border-[var(--border-default)] sm:max-w-md rounded-2xl shadow-[var(--shadow-xl)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--text)]">Change Password</DialogTitle>
            <DialogDescription className="text-[var(--text-secondary)]">
              Enter your new password below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-tertiary)]">
                New Password
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="udon-input"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-tertiary)]">
                Confirm New Password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your new password"
                className="udon-input"
              />
            </div>
            {passwordError && (
              <p className="text-[12px] text-[var(--danger)]">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="text-[12px] text-[var(--success)]">Password updated successfully</p>
            )}
          </div>
          <DialogSeparator className="bg-[var(--border-light)]" />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowPasswordModal(false); setPasswordError(""); setPasswordSuccess(false); }} className="udon-btn-secondary">
              Cancel
            </Button>
            <Button className="udon-btn-primary" onClick={handlePasswordChange} disabled={passwordLoading || !newPassword || !confirmPassword}>
              {passwordLoading ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
