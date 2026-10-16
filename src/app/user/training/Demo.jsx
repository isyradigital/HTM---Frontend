import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function Demo() {
    return (
        <div className="p-6">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle>Training Demo Card</CardTitle>
                    <CardDescription>Explore your assigned hospital training modules and track progress.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        This card is designed following the global styling guidelines and component-based architecture for a consistent user experience.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline">View Details</Button>
                    <Button>Join Training</Button>
                </CardFooter>
            </Card>
        </div>
    );
}

export default Demo;
