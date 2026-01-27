import { supabase } from './supabase';
import { RecurrenceFrequency } from '../types';
import { addMonths, addWeeks, addYears, parseISO, format } from 'date-fns';

export const processRecurringTransactions = async (userId: string) => {
  const today = new Date().toISOString().split('T')[0];

  // 1. Get due recurring transactions
  const { data: dueTransactions, error } = await supabase
    .from('recurring_transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true)
    .lte('next_run', today);

  if (error) {
    console.error('Error fetching recurring transactions:', error);
    return;
  }

  if (!dueTransactions || dueTransactions.length === 0) return;

  for (const recurring of dueTransactions) {
    // 2. Create the new transaction
    const { error: insertError } = await supabase.from('transactions').insert({
      user_id: userId,
      description: recurring.description,
      amount: recurring.amount,
      category: recurring.category,
      type: recurring.type,
      is_essential: recurring.is_essential,
      payment_method: recurring.payment_method,
      date: recurring.next_run, // Use the scheduled date
    });

    if (insertError) {
      console.error('Error creating recurring transaction instance:', insertError);
      continue;
    }

    // 3. Calculate next run date
    let nextDate = parseISO(recurring.next_run);
    switch (recurring.frequency as RecurrenceFrequency) {
      case 'weekly':
        nextDate = addWeeks(nextDate, 1);
        break;
      case 'monthly':
        nextDate = addMonths(nextDate, 1);
        break;
      case 'yearly':
        nextDate = addYears(nextDate, 1);
        break;
    }

    // 4. Update the recurring transaction
    const { error: updateError } = await supabase
      .from('recurring_transactions')
      .update({ next_run: format(nextDate, 'yyyy-MM-dd') })
      .eq('id', recurring.id);

    if (updateError) {
      console.error('Error updating next run date:', updateError);
    }
  }
};
