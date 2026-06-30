import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Controller, FormProvider, useFormContext, type ControllerProps, type FieldPath, type FieldValues } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const Form = FormProvider;

type FormFieldContextValue<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = { name: TName };
const FormFieldContext = React.createContext<FormFieldContextValue>({} as any);

const FormField = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
  ...props
}: ControllerProps<TFieldValues, TName>) => (
  <FormFieldContext.Provider value={{ name: props.name }}>
    <Controller {...props} />
  </FormFieldContext.Provider>
);

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const { getFieldState, formState } = useFormContext();
  const fieldState = getFieldState(fieldContext.name, formState);
  return { id: fieldContext.name, name: fieldContext.name, ...fieldState };
};

type FormItemContextValue = { id: string };
const FormItemContext = React.createContext<FormItemContextValue>({} as any);

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = React.useId();
    return (
      <FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={cn("space-y-2", className)} {...props} />
      </FormItemContext.Provider>
    );
  }
);
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<React.ComponentRef<typeof Label>, React.ComponentPropsWithoutRef<typeof Label>>(
  ({ className, ...props }, ref) => {
    const { error } = useFormField();
    return <Label ref={ref} className={cn(error && "text-destructive", className)} {...props} />;
  }
);
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<React.ComponentRef<typeof Slot>, React.ComponentPropsWithoutRef<typeof Slot>>(
  ({ ...props }, ref) => {
    const { error, id } = useFormField();
    return <Slot ref={ref} id={id} aria-invalid={!!error} {...props} />;
  }
);
FormControl.displayName = "FormControl";

const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    const { error } = useFormField();
    const body = error ? String(error?.message) : children;
    if (!body) return null;
    return <p ref={ref} className={cn("text-sm font-medium text-destructive", className)} {...props}>{body}</p>;
  }
);
FormMessage.displayName = "FormMessage";

export { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, useFormField };
