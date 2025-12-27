import React, { useEffect, useState } from 'react';
import { APP_NAME } from '@/config/app';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/hooks/useTransactions';
import { LogOut, Download, Trash2, User, Shield, CircleHelp as HelpCircle, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProfile } from '@/hooks/useProfile';
import { PageHeader } from '@/components/PageHeader';
import { usePageHeader } from '@/hooks/usePageHeader';
import { CURRENCIES } from '@/utils/currencyConfig';
const Settings = () => {
  const {
    user,
    signOut
  } = useAuth();
  const {
    transactions,
    deleteAllTransactions
  } = useTransactions();
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const { profile, updateProfile, updating } = useProfile();
  const [profileForm, setProfileForm] = useState({ preferred_name: '', currency: 'GHS' });
  const { header } = usePageHeader('settings');

  useEffect(() => {
    setProfileForm({
      preferred_name: profile?.preferred_name || '',
      currency: profile?.currency || 'GHS',
    });
  }, [profile]);
  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error signing out',
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast({
        title: 'No data to export',
        description: 'Add some transactions first before exporting.'
      });
      return;
    }

    // Create CSV content
    const headers = ['Date', 'Type', 'Category', 'Amount (₵)', 'Note'];
    const csvContent = [headers.join(','), ...transactions.map(transaction => [transaction.date, transaction.type, `"${transaction.category}"`, transaction.amount.toFixed(2), `"${transaction.note || ''}"`].join(','))].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `penny-pal-transactions-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: 'Export successful!',
      description: 'Your transactions have been downloaded as CSV.'
    });
  };
  const handleDeleteAllData = async () => {
    if (transactions.length === 0) {
      toast({
        title: 'No data to delete',
        description: 'There are no transactions to delete.'
      });
      return;
    }
    if (confirm('Are you sure you want to delete ALL your transaction data? This action cannot be undone.')) {
      await deleteAllTransactions();
    }
  };
  const handleSaveProfile = async () => {
    await updateProfile({
      preferred_name: profileForm.preferred_name || null,
      currency: profileForm.currency,
    });
  };
  return <Layout>
    {header && (
      <PageHeader
        title={header.title}
        subtitle={header.subtitle}
        imageUrl={header.image_url}
        mobileImageUrl={header.mobile_image_url}
        altText={header.alt_text}
        heightMobile={header.height_mobile}
        heightDesktop={header.height_desktop}
        overlayOpacity={header.overlay_opacity}
        textColor={header.text_color}
      />
    )}
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-poppins font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile Information */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Profile Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Preferred Name</Label>
              <Input
                value={profileForm.preferred_name}
                onChange={(e) => setProfileForm((p) => ({ ...p, preferred_name: e.target.value }))}
                placeholder="Preferred name"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Preferred Currency</Label>
              <select
                value={profileForm.currency}
                onChange={(e) => setProfileForm((p) => ({ ...p, currency: e.target.value }))}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary mt-2"
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.name} ({curr.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} disabled={updating}>
              {updating ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Account Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="font-medium text-foreground">Email Address</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-foreground">Account Created</p>
              <p className="text-sm text-muted-foreground">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Unknown'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Data Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="font-medium text-foreground">Export Data</p>
              <p className="text-sm text-muted-foreground">
                Download all your transactions as a CSV file
              </p>
            </div>
            <Button onClick={handleExportCSV} variant="outline" className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </Button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-foreground">Delete All Data</p>
              <p className="text-sm text-muted-foreground mx-0 py-0">Permanently delete
                all your transactions (cannot be undone)</p>
            </div>
            <Button onClick={handleDeleteAllData} variant="destructive" className="flex items-center space-x-2">
              <Trash2 className="w-4 h-4" />
              <span>Delete All</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Your Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-2xl font-poppins font-bold text-primary">
                {transactions.length}
              </p>
              <p className="text-sm text-muted-foreground">Total Transactions</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-2xl font-poppins font-bold text-accent">
                {new Set(transactions.map(t => t.category)).size}
              </p>
              <p className="text-sm text-muted-foreground">Categories Used</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help & About */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <HelpCircle className="w-5 h-5" />
            <span>About {APP_NAME}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {APP_NAME} is your personal budget tracker designed to help you manage your finances
            in this economy charle. Track your income, expenses, and get insights into your spending habits.
          </p>
          <p className="text-sm text-muted-foreground">
            This was built as a personal project by Big Sam. Hope you love it ❤️
          </p>
        </CardContent>
      </Card>

      {/* Privacy & Policy */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Privacy & Policy</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-foreground">Privacy & Data Policy</p>
              <p className="text-sm text-muted-foreground">
                View our privacy policy and data handling practices
              </p>
            </div>
            <Button
              onClick={() => setShowPrivacyModal(true)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>View Policy</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card className="shadow-md border-destructive/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Sign Out</p>
              <p className="text-sm text-muted-foreground">Sign out of your
                {APP_NAME} account</p>
            </div>
            <Button onClick={handleSignOut} variant="destructive" disabled={loading} className="flex items-center space-x-2">
              <LogOut className="w-4 h-4" />
              <span>{loading ? 'Signing out...' : 'Sign Out'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <PrivacyPolicyModal
        open={showPrivacyModal}
        onOpenChange={setShowPrivacyModal}
      />
    </div>
  </Layout>;
};
export default Settings;
