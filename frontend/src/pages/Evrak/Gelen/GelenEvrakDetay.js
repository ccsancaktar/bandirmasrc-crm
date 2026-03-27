import { useNavigate } from 'react-router-dom';
import EvrakDetay from '../EvrakDetay';
export default function GelenEvrakDetay({ evrakId, onEdit }) {
  const navigate = useNavigate();
  return <EvrakDetay evrakId={evrakId} type="gelen" onEdit={onEdit} onBack={() => navigate('/evrak?tab=gelen')} />;
} 