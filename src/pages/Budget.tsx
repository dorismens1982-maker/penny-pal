import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';

// Budget builder lives here. This first version is a placeholder so the
// navigation can be reviewed; the builder screens are built next.
const Budget = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 pt-6 pb-24 md:pb-10 max-w-3xl">
        <h1 className="font-poppins text-2xl font-bold text-foreground">Budget</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Plan how your money should be spent, and see how you are doing against it.
        </p>

        <Card className="mt-6 rounded-2xl">
          <CardContent className="p-6">
            <p className="font-medium text-foreground">Budget builder coming next</p>
            <p className="text-sm text-muted-foreground mt-1">
              You will be able to start from a template (student, worker, family) or build your own
              categories, with a note on what each one is for.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Budget;
