import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Shield } from 'lucide-react';

interface PrivacyPolicyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PrivacyPolicyModal = ({ open, onOpenChange }: PrivacyPolicyModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-primary" />
            <span>🔒 Privacy & Data Policy</span>
          </DialogTitle>
          <DialogDescription>
            Your financial information is private and secure.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <div className="space-y-3">
            <p>
              <strong className="text-foreground">Your financial information is private and secure.</strong>
            </p>
            
            <ul className="space-y-2 ml-4 list-disc">
              <li>We do not share your data with third parties.</li>
              <li>Your goals, budgets, and transactions are only visible to you.</li>
              <li>You are in full control of your data.</li>
            </ul>
            
            <p>
              This app is for personal use and designed to keep your information safe.
            </p>
            
            <div className="mt-4 p-3 bg-muted/50 rounded-md">
              <p className="text-xs text-muted-foreground">
                <strong>Data Storage:</strong> Your data is securely stored using Supabase with industry-standard encryption. You can export or delete your data at any time from the Settings page.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyPolicyModal;