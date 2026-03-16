import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import TrackingPixels from "@/components/TrackingPixels";
import Index from "./pages/Index";
import {
  EinparkenFahrpruefung,
  DreipunktWenden,
  ManoeverFahrpruefung,
  LernfristSchweiz,
  KontrollfahrtSchweiz,
} from "./pages/SEOPages";

const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Admin = lazy(() => import("./pages/Admin"));
const Zugang = lazy(() => import("./pages/Zugang"));
const Checkout = lazy(() => import("./pages/Checkout"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const CoursePage = lazy(() => import("./pages/Course"));
const LessonPage = lazy(() => import("./pages/Lesson"));
const VideoPage = lazy(() => import("./pages/Video"));
const Lernvideos = lazy(() => import("./pages/Lernvideos"));
const Flyer = lazy(() => import("./pages/Flyer"));
const Blog = lazy(() => import("./pages/Blog"));
const StaticPage = lazy(() => import("./pages/StaticPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <TrackingPixels />
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/zugang" element={<Zugang />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/course/:courseId" element={<CoursePage />} />
            <Route path="/course/:courseId/lesson/:lessonId" element={<LessonPage />} />
            <Route path="/video/:videoId" element={<VideoPage />} />
            <Route path="/lernvideos" element={<Lernvideos />} />
            <Route path="/flyer" element={<Flyer />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/einparken-fahrpruefung-schweiz" element={<EinparkenFahrpruefung />} />
            <Route path="/dreipunkt-wenden-schweiz" element={<DreipunktWenden />} />
            <Route path="/manoever-fahrpruefung-kat-b" element={<ManoeverFahrpruefung />} />
            <Route path="/lernfrist-schweiz" element={<LernfristSchweiz />} />
            <Route path="/kontrollfahrt-schweiz" element={<KontrollfahrtSchweiz />} />
            <Route path="/:slug" element={<StaticPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
