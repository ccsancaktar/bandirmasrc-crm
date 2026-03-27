import EvrakDetay from '../EvrakDetay';
export default function GidenEvrakDetay({ evrakId, onEdit }) {
  return <EvrakDetay evrakId={evrakId} type="giden" onEdit={onEdit} />;
} 