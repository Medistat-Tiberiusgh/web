import { useState } from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { GoogleMark, GitHubMark } from './ProviderMarks'
import { startGithubLogin, startGoogleLogin } from '../../lib/oauth'
import {
  SURFACE_DANGER,
  BORDER_DANGER,
  TEXT_DANGER,
  TEXT_MUTED,
  TEXT_MUTED_HOVER
} from '../../theme'

export default function AuthButtons({ authError }: { authError: boolean }) {
  const [dismissed, setDismissed] = useState(false)

  return (
    <div className="relative flex items-center gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            Sign in
          </Button>
        </DialogTrigger>
        <DialogTrigger asChild>
          <Button size="sm">Register</Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Continue to Medistat</DialogTitle>
            <DialogDescription>
              Sign in or create your account. New accounts are created
              automatically on your first sign-in.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="justify-center"
              onClick={startGoogleLogin}
            >
              <GoogleMark /> Continue with Google
            </Button>
            <Button
              variant="outline"
              className="justify-center"
              onClick={startGithubLogin}
            >
              <GitHubMark /> Continue with GitHub
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {authError && !dismissed && (
        <div
          role="alert"
          className={`absolute right-0 top-full mt-2 z-50 flex items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-2 text-sm shadow-md ${SURFACE_DANGER} ${BORDER_DANGER} ${TEXT_DANGER}`}
        >
          <span>Sign-in failed — please try again</span>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss"
            className={`${TEXT_MUTED} ${TEXT_MUTED_HOVER}`}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
