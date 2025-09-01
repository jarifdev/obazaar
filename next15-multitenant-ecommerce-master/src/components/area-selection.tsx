import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAreas } from "@/hooks/use-areas";
import { Control } from "react-hook-form";

interface AreaSelectionProps {
  control: Control<any>;
  stateValue?: number;
  wilayaValue?: number;
  areaValue?: number;
  onStateChange: (value: number) => void;
  onWilayaChange: (value: number) => void;
  onAreaChange: (value: number) => void;
}

export const AreaSelection: React.FC<AreaSelectionProps> = ({
  control,
  stateValue,
  wilayaValue,
  areaValue,
  onStateChange,
  onWilayaChange,
  onAreaChange,
}) => {
  const { areaData, loading, error, getWilayasByState, getAreasByWilaya } =
    useAreas();

  if (loading) {
    return <div className="text-sm text-gray-500">Loading areas...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-500">Error: {error}</div>;
  }

  const availableWilayas = stateValue ? getWilayasByState(stateValue) : [];
  const availableAreas = wilayaValue ? getAreasByWilaya(wilayaValue) : [];

  return (
    <div className="space-y-4">
      {/* State Selection */}
      <FormField
        control={control}
        name="shipping.stateId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>State *</FormLabel>
            <Select
              value={field.value?.toString()}
              onValueChange={(value) => {
                const stateId = parseInt(value);
                field.onChange(stateId);
                onStateChange(stateId);
                // Reset wilaya and area when state changes
                onWilayaChange(0);
                onAreaChange(0);
              }}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {areaData?.states.map((state) => (
                  <SelectItem key={state.id} value={state.id.toString()}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Wilaya Selection */}
      <FormField
        control={control}
        name="shipping.wilayaId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Wilaya *</FormLabel>
            <Select
              value={field.value?.toString()}
              onValueChange={(value) => {
                const wilayaId = parseInt(value);
                field.onChange(wilayaId);
                onWilayaChange(wilayaId);
                // Reset area when wilaya changes
                onAreaChange(0);
              }}
              disabled={!stateValue || availableWilayas.length === 0}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a wilaya" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {availableWilayas.map((wilaya) => (
                  <SelectItem key={wilaya.id} value={wilaya.id.toString()}>
                    {wilaya.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Area Selection */}
      <FormField
        control={control}
        name="shipping.areaId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Area *</FormLabel>
            <Select
              value={field.value?.toString()}
              onValueChange={(value) => {
                const areaId = parseInt(value);
                field.onChange(areaId);
                onAreaChange(areaId);
              }}
              disabled={!wilayaValue || availableAreas.length === 0}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select an area" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {availableAreas.map((area) => (
                  <SelectItem key={area.id} value={area.id.toString()}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
