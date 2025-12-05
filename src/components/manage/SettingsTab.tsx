import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { User, Shield, Download, Trash2, Eye, LogOut } from 'lucide-react';
import { APP_NAME } from '@/config/app';

interface SettingsTabProps {
    profileForm: { preferred_name: string };
    setProfileForm: (form: { preferred_name: string }) => void;
    handleSaveProfile: () => void;
    updating: boolean;
    user: any;
    handleExportCSV: () => void;
    handleDeleteAllData: () => void;
    setShowPrivacyModal: (show: boolean) => void;
    handleSignOut: () => void;
}

export const SettingsTab = ({
    profileForm,
    setProfileForm,
    handleSaveProfile,
    updating,
    user,
    handleExportCSV,
    handleDeleteAllData,
    setShowPrivacyModal,
    handleSignOut
}: SettingsTabProps) => {
    return (
        <div className="space-y-6">
            {/* Profile */}
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Profile
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Preferred Name</Label>
                        <Input
                            value={profileForm.preferred_name}
                            onChange={(e) => setProfileForm({ preferred_name: e.target.value })}
                            placeholder="How should we call you?"
                        />
                    </div>
                    <Button onClick={handleSaveProfile} disabled={updating}>
                        {updating ? 'Saving...' : 'Save Changes'}
                    </Button>
                </CardContent>
            </Card>

            {/* Account Info */}
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Account
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="py-2 border-b">
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                    <div className="py-2">
                        <p className="font-medium">Member Since</p>
                        <p className="text-sm text-muted-foreground">
                            {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Data Management */}
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle>Data Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b">
                        <div>
                            <p className="font-medium">Export Data</p>
                            <p className="text-sm text-muted-foreground">Download all your transactions as CSV</p>
                        </div>
                        <Button onClick={handleExportCSV} variant="outline" className="gap-2">
                            <Download className="w-4 h-4" />
                            Export
                        </Button>
                    </div>
                    <div className="flex items-center justify-between py-3">
                        <div>
                            <p className="font-medium">Delete All Data</p>
                            <p className="text-sm text-muted-foreground">Permanently delete all transactions</p>
                        </div>
                        <Button onClick={handleDeleteAllData} variant="destructive" className="gap-2">
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Privacy */}
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle>Privacy & Policy</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Privacy Policy</p>
                            <p className="text-sm text-muted-foreground">View our privacy and data practices</p>
                        </div>
                        <Button onClick={() => setShowPrivacyModal(true)} variant="outline" className="gap-2">
                            <Eye className="w-4 h-4" />
                            View
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Sign Out */}
            <Card className="shadow-md border-destructive/20">
                <CardContent className="pt-6 flex items-center justify-between">
                    <div>
                        <p className="font-medium">Sign Out</p>
                        <p className="text-sm text-muted-foreground">Sign out of your {APP_NAME} account</p>
                    </div>
                    <Button onClick={handleSignOut} variant="destructive" className="gap-2">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};
