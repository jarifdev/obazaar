import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AreaSelection } from "@/components/area-selection";

const shippingSchema = z.object({
  shipping: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z
      .string()
      .regex(/^[\+]?[\d\s\-\(\)]{8,}$/, "Please enter a valid phone number"),
    stateId: z.number().min(1, "Please select a state"),
    wilayaId: z.number().min(1, "Please select a wilaya"),
    areaId: z.number().min(1, "Please select an area"),
    address: z.string().min(10, "Please provide a detailed address"),
  }),
  deliveryNotes: z.string().optional(),
});

export type ShippingFormData = z.infer<typeof shippingSchema>;

interface ShippingFormProps {
  onSubmit: (data: ShippingFormData) => void;
  loading?: boolean;
  defaultValues?: Partial<ShippingFormData>;
}

export const ShippingForm: React.FC<ShippingFormProps> = ({
  onSubmit,
  loading = false,
  defaultValues,
}) => {
  const [selectedState, setSelectedState] = useState<number>(
    defaultValues?.shipping?.stateId || 0
  );
  const [selectedWilaya, setSelectedWilaya] = useState<number>(
    defaultValues?.shipping?.wilayaId || 0
  );
  const [selectedArea, setSelectedArea] = useState<number>(
    defaultValues?.shipping?.areaId || 0
  );

  const form = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      shipping: {
        name: "",
        phone: "",
        stateId: 0,
        wilayaId: 0,
        areaId: 0,
        address: "",
      },
      deliveryNotes: "",
      ...defaultValues,
    },
  });

  const handleSubmit = (data: ShippingFormData) => {
    onSubmit(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Shipping Information</h3>
        <p className="text-sm text-gray-600">
          Please provide your delivery details
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Receiver Name */}
          <FormField
            control={form.control}
            name="shipping.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Receiver Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter receiver's full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone Number with +968 prefix */}
          <FormField
            control={form.control}
            name="shipping.phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number *</FormLabel>
                <FormControl>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-md">
                      +968
                    </span>
                    <Input
                      placeholder="12345678"
                      className="rounded-l-none"
                      {...field}
                      onChange={(e) => {
                        // Only allow 8 digits
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 8);
                        field.onChange(value);
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Area Selection */}
          <AreaSelection
            control={form.control}
            stateValue={selectedState}
            wilayaValue={selectedWilaya}
            areaValue={selectedArea}
            onStateChange={setSelectedState}
            onWilayaChange={setSelectedWilaya}
            onAreaChange={setSelectedArea}
          />

          {/* Detailed Address */}
          <FormField
            control={form.control}
            name="shipping.address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Detailed Address *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Building name, street, landmarks, etc."
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Delivery Notes */}
          <FormField
            control={form.control}
            name="deliveryNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delivery Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Special instructions, preferred delivery time, etc."
                    className="min-h-[60px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-[#1c476f] hover:bg-[#0f2c47] text-white"
            disabled={loading}
            size="lg"
          >
            {loading ? "Processing..." : "Continue to Payment"}
          </Button>
        </form>
      </Form>
    </div>
  );
};
