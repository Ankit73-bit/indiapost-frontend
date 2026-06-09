import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ALL_CLIENTS = '__all_clients__';

interface ClientFilterSelectProps {
  clients: Array<{ _id: string; name: string }>;
  value: string | undefined;
  onChange: (clientId: string | undefined) => void;
  className?: string;
}

export function ClientFilterSelect({
  clients,
  value,
  onChange,
  className = 'w-[200px]',
}: ClientFilterSelectProps) {
  return (
    <Select
      value={value || ALL_CLIENTS}
      onValueChange={(v) =>
        onChange(v === ALL_CLIENTS ? undefined : v)
      }
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder="All clients" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_CLIENTS}>All clients</SelectItem>
        {clients.map((c) => (
          <SelectItem key={c._id} value={c._id}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
