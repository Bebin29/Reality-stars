import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-foreground">Reality Stars - Design System</h1>
        
        {/* Test new color palette */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Custom Color Palette</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Gunmetal</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gunmetal-300 text-white p-3 rounded text-center text-sm">300</div>
                <div className="bg-gunmetal-500 text-white p-3 rounded text-center text-sm">500</div>
                <div className="bg-gunmetal-700 text-white p-3 rounded text-center text-sm">700</div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Chinese Violet</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-chinese_violet-300 text-white p-3 rounded text-center text-sm">300</div>
                <div className="bg-chinese_violet-500 text-white p-3 rounded text-center text-sm">500</div>
                <div className="bg-chinese_violet-700 text-white p-3 rounded text-center text-sm">700</div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">French Mauve</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-french_mauve-300 text-white p-3 rounded text-center text-sm">300</div>
                <div className="bg-french_mauve-500 text-white p-3 rounded text-center text-sm">500</div>
                <div className="bg-french_mauve-700 text-white p-3 rounded text-center text-sm">700</div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Amaranth Pink</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-amaranth_pink-300 text-white p-3 rounded text-center text-sm">300</div>
                <div className="bg-amaranth_pink-500 text-white p-3 rounded text-center text-sm">500</div>
                <div className="bg-amaranth_pink-700 text-white p-3 rounded text-center text-sm">700</div>
              </div>
            </div>
          </div>
        </div>

        {/* Test shadcn components with new theme */}
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Reality Stars Login</CardTitle>
            <CardDescription>
              Experience the new design system with our custom color palette.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-input">Email Address</Label>
              <Input
                id="test-input"
                type="email"
                placeholder="your@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-input">Password</Label>
              <Input
                id="password-input"
                type="password"
                placeholder="••••••••"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="default">Sign In</Button>
              <Button variant="outline">Cancel</Button>
              <Button variant="secondary">Help</Button>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="destructive">Delete</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Forgot Password?</Button>
            </div>
          </CardContent>
        </Card>

        {/* Test CSS variables with new theme */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Theme System</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-primary text-primary-foreground p-4 rounded-lg text-center">
              <div className="font-semibold">Primary</div>
              <div className="text-sm opacity-90">Chinese Violet</div>
            </div>
            <div className="bg-secondary text-secondary-foreground p-4 rounded-lg text-center">
              <div className="font-semibold">Secondary</div>
              <div className="text-sm opacity-90">Gunmetal</div>
            </div>
            <div className="bg-muted text-muted-foreground p-4 rounded-lg text-center">
              <div className="font-semibold">Muted</div>
              <div className="text-sm opacity-90">Subtle</div>
            </div>
            <div className="bg-accent text-accent-foreground p-4 rounded-lg text-center">
              <div className="font-semibold">Accent</div>
              <div className="text-sm opacity-90">French Mauve</div>
            </div>
          </div>
        </div>

        {/* Dark mode toggle hint */}
        <div className="bg-card border p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Dark Mode</h3>
          <p className="text-muted-foreground">
            The theme automatically adapts to your system preference. 
            Try switching your system to dark mode to see the dark theme in action!
          </p>
        </div>
      </div>
    </div>
  );
} 