import { Request, Response } from 'express';
import { db } from '../database/connection';

import convertHourToMinute from '../utils/convertHourToMinute';

type ScheduleClass = {
    week_day: number,
    from: string;
    to: string
}


export default class ClassesController {
    async create(request: Request, response: Response) {
        const {
            name,
            avatar,
            whatsapp,
            bio,
            subject,
            cost,
            schedule
        } = request.body;
    
        const trx = await db.transaction();
    
        try {
            const insertedUsersIds = await trx('users').insert({
                name,
                avatar,
                whatsapp,
                bio
            });
        
            const user_id = insertedUsersIds[0]
        
            const insertedClassesIds = await trx('classes').insert({
                subject,
                cost,
                user_id,
            });
        
            const class_id = insertedClassesIds[0]
        
            const classSchedule = schedule.map((scheduleItem: ScheduleClass) => {
                return {
                    week_day: scheduleItem.week_day,
                    from: convertHourToMinute(scheduleItem.from),
                    to: convertHourToMinute(scheduleItem.to),
                    class_id: class_id
                };
            });
        
            await trx('class_schedule').insert(classSchedule)
        
            await trx.commit();
        
            return response.status(201).send();
            
        } catch (err) {
            await trx.rollback();
    
            return response.status(400).json({
                error: 'Unexpected error while creating new class'
            })
        }
    }
}