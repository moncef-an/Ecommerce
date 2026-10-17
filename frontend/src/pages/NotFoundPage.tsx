import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="py-24 text-center bg-[#09090b]">
      <PageContainer size="narrow">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-purple-950/60 border border-purple-500/30 text-purple-400 shadow-xl">
            <Compass className="h-8 w-8" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">404 Error</span>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Page Not Found</h1>
          <p className="max-w-md text-sm text-zinc-400">
            The page or catalog collection you are looking for has been moved or does not exist.
          </p>
          <div className="pt-4">
            <Link to="/home">
              <Button
                className="bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg shadow-purple-900/40"
                leftIcon={<Home className="h-4 w-4" />}
              >
                Return to Storefront
              </Button>
            </Link>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};
