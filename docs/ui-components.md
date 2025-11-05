# UI Components (shadcn)

All components are re-exported under `src/components/ui/*`. Below is a compact reference of import paths and exported symbols. See file sources for full prop types, which are standard shadcn/Radix types with minor wrappers like `cn`.

- `@/components/ui/accordion`: `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`
- `@/components/ui/alert`: `Alert`, `AlertTitle`, `AlertDescription`
- `@/components/ui/alert-dialog`: `AlertDialog` and related subcomponents
- `@/components/ui/aspect-ratio`: `AspectRatio`
- `@/components/ui/avatar`: `Avatar`, `AvatarImage`, `AvatarFallback`
- `@/components/ui/badge`: `Badge`, `badgeVariants` (with `BadgeProps`)
- `@/components/ui/breadcrumb`: `Breadcrumb` and related subcomponents
- `@/components/ui/button`: `Button`, `buttonVariants` (with `ButtonProps`)
- `@/components/ui/calendar`: `Calendar`, `type CalendarProps`
- `@/components/ui/card`: `Card`, `CardHeader`, `CardFooter`, `CardTitle`, `CardDescription`, `CardContent`
- `@/components/ui/carousel`: `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext`, `type CarouselApi`
- `@/components/ui/checkbox`: `Checkbox`
- `@/components/ui/chart`: `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent`, `ChartStyle`, `type ChartConfig`
- `@/components/ui/collapsible`: `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`
- `@/components/ui/command`: `Command` and related subcomponents
- `@/components/ui/context-menu`: `ContextMenu` and related subcomponents
- `@/components/ui/dialog`: `Dialog` and related subcomponents
- `@/components/ui/drawer`: `Drawer` and related subcomponents
- `@/components/ui/dropdown-menu`: `DropdownMenu` and related subcomponents
- `@/components/ui/form`: `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`, `useFormField`
- `@/components/ui/hover-card`: `HoverCard`, `HoverCardTrigger`, `HoverCardContent`
- `@/components/ui/input`: `Input`
- `@/components/ui/input-otp`: `InputOTP`, `InputOTPGroup`, `InputOTPSlot`, `InputOTPSeparator`
- `@/components/ui/label`: `Label`
- `@/components/ui/menubar`: `Menubar` and related subcomponents
- `@/components/ui/navigation-menu`: `NavigationMenu` and related subcomponents; `navigationMenuTriggerStyle`
- `@/components/ui/pagination`: `Pagination` and related subcomponents
- `@/components/ui/popover`: `Popover`, `PopoverTrigger`, `PopoverContent`
- `@/components/ui/progress`: `Progress`
- `@/components/ui/radio-group`: `RadioGroup`, `RadioGroupItem`
- `@/components/ui/resizable`: `ResizablePanelGroup`, `ResizablePanel`, `ResizableHandle`
- `@/components/ui/scroll-area`: `ScrollArea`, `ScrollBar`
- `@/components/ui/select`: `Select` and related subcomponents
- `@/components/ui/separator`: `Separator`
- `@/components/ui/sheet`: `Sheet` and related subcomponents
- `@/components/ui/skeleton`: `Skeleton`
- `@/components/ui/slider`: `Slider`
- `@/components/ui/sonner`: `Toaster`, `toast`
- `@/components/ui/switch`: `Switch`
- `@/components/ui/table`: `Table` and related subcomponents
- `@/components/ui/tabs`: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- `@/components/ui/textarea`: `Textarea`, `TextareaProps`
- `@/components/ui/toast`: `ToastProvider`, `ToastViewport`, `Toast`, `ToastTitle`, `ToastDescription`, `ToastClose`, `ToastAction`, `type ToastProps`, `type ToastActionElement`
- `@/components/ui/toaster`: `Toaster`
- `@/components/ui/toggle`: `Toggle`, `toggleVariants`
- `@/components/ui/toggle-group`: `ToggleGroup`, `ToggleGroupItem`
- `@/components/ui/tooltip`: `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`
- `@/components/ui/sidebar`: `Sidebar` and related subcomponents; `useSidebar`

General example:
```tsx
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild><Button>Open</Button></DialogTrigger>
  <DialogContent>Content</DialogContent>
</Dialog>
```
