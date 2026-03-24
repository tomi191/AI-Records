import { SignIn } from '@clerk/nextjs';

export const metadata = {
  title: 'Вход | AI-Records',
  description: 'Влез в своя AI-Records акаунт',
};

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center rounded-2xl bg-gray-900 border border-gray-800 p-8">
          <SignIn
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'bg-transparent shadow-none w-full',
                headerTitle: 'text-white',
                headerSubtitle: 'text-gray-400',
                socialButtonsBlockButton:
                  'bg-gray-800 border-gray-700 text-white hover:bg-gray-700',
                formFieldLabel: 'text-gray-300',
                formFieldInput:
                  'bg-gray-800 border-gray-700 text-white placeholder-gray-500',
                footerActionLink: 'text-purple-400 hover:text-purple-300',
                formButtonPrimary:
                  'bg-purple-600 hover:bg-purple-700 text-white',
                dividerLine: 'bg-gray-700',
                dividerText: 'text-gray-500',
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
