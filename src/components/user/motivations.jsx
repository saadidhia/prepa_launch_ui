import { useEffect, useState } from 'react'
import { candidatsApi } from '../../apis/candidatsApi'
import { adminApi } from '../../apis/adminApi';
import { useAuth } from '../context/AuthContext'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

export function Motivations() {
  const Auth = useAuth()
  const user = Auth.getUser()
  const [motivations, setMotivations] = useState([]);
  const isAdmin = user.data.rol[0] === 'ADMIN';
  const [successMessage,setSuccessMessage] = useState('')


  useEffect(() => {

    fetchMotivation()
  }, [])
  const fetchMotivation = async () => {

    try {
      console.log(user)
      const response = await candidatsApi.getMotivations(user);
      console.log(response.data);
      setMotivations(response.data.filter(motivation => motivation.description !== null));
    } catch (error) {
      console.error("Error fetching Motivations:", error);
    }
  }

  const deleteMotivation = async (motivationId) => {
    try {
      await adminApi.deleteMotivation(user, motivationId);

      setSuccessMessage("Deleted Successfully")
      fetchMotivation()
      setTimeout(() => {
        setSuccessMessage('');
      }, 2000);
    
    } catch (error) {
      console.error('Error deleting Motivation:', error);
    }
  };
  return (
    <>
      <div>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {motivations.map((motivation, index) => (
            <Card key={index} style={{ margin: '10px', minWidth: '200px' }}>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  {motivation.title}
                </Typography>
                <Typography variant="body1" component="p">
                  {motivation.description}
                </Typography>
                {isAdmin &&

                  <button onClick={() => deleteMotivation(motivation.id)}>
                    Delete
                  </button>
                }

              </CardContent>
            </Card>
          ))}
          
        </div>
        <p style={{ color: 'red' }}>{successMessage}</p>
      </div>
    </>
  )
}
