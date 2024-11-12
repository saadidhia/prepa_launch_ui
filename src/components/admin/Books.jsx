import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Image } from '../image'
import { Box, Grid, Card, CardContent, Typography } from '@mui/material';
import { adminApi } from '../../apis/adminApi'
import DeleteButton from '../../components/small/deleteButton';


export function Books() {

    const [books, setBooks] = useState([])
    const Auth = useAuth()
    const currentAdmin = Auth.getUser();

    const fetchBooks = async () => {

        try {
            const response = await adminApi.getBooks(currentAdmin);
            const data = response.data;
            setBooks(data);
        } catch (error) {
            console.error('Error fetching books:', error);
        }
    };

    useEffect(() => {
        fetchBooks()
    }, [])

    const handleDelete = async (id) => {
        try {
            await adminApi.deleteBook(currentAdmin, id);
            setBooks(books.filter(book => book.id !== id));
        } catch (error) {
            console.error('Error deleting book:', error);
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom align="center">
                Books
            </Typography>
            <Grid container spacing={2} justifyContent="center">
                {books.map((card) => (
                    <Grid item key={card.id} xs={12} sm={6} md={4} lg={3}>
                        <Card>
                        
                            <Image
                                name={card.name}
                                description={card.description}
                                price={card.price}
                                levels={card.levels}
                                subjects={card.subjects}
                                fields={card.fields}
                                link={card.link}
                                largeImage={card.largeImage}
                                smallImage={card.smallImage}
                            />
                            <CardContent>
                                <Typography variant="body2" color="textSecondary">
                                    {card.description}
                                </Typography>
                                <DeleteButton onDelete={() => handleDelete(card.id)} /> {/* Use DeleteButton component */}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    )
}
