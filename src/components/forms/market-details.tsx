'use client'

import { Market } from '@prisma/client'
import React, { use, useEffect, useState } from 'react'
import { useToast } from '../ui/use-toast'
import { useRouter } from 'next/navigation'
import { AlertDialog } from '@radix-ui/react-alert-dialog'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form'
import { useForm } from 'react-hook-form'

import * as z from 'zod'
import FileUpload from '../global/file-upload'


type Props = {
  data?: Partial<Market>
}

const FormSchema = z.object({
  name: z.string().min(3, { message: 'Market name must be atleast 3 characters.' }),
  companyEmail: z.string().min(5),
  companyPhone: z.string().min(10),
  whiteLabel: z.boolean(),
  address: z.string().min(2),
  city: z.string().min(2),
  zipCode: z.string().min(3),
  state: z.string().min(2),
  country: z.string().min(2),
  marketLogo: z.string().min(1),
})

const MarketDetails = ({data}: Props) => {

  const {toast} = useToast()
  const router = useRouter()
  const [deletingMarket, setDeletingMarket] = useState(false)
  const form = useForm<z.infer<typeof FormSchema>>({
    mode: 'onChange',
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: data?.name,
      companyEmail: data?.companyEmail,
      companyPhone: data?.companyPhone,
      whiteLabel: data?.whiteLabel || false,
      address: data?.address,
      city: data?.city,
      zipCode: data?.zipCode,
      state: data?.state,
      country: data?.country,
      marketLogo: data?.marketLogo,
    },
  })
  const isLoading = form.formState.isSubmitting

  useEffect(() => {
    if (data) {
      form.reset(data)
    }
  }, [data])

  const handleSubmit = async () => {}

  return (
    <AlertDialog>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Market Information</CardTitle>
          <CardDescription>
            Lets create you market. You can edit your market settings later from the market settings tab.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}
                  className='space-y-4'
            >
              <FormField 
              disabled={isLoading}
              control={form.control}
              name="marketLogo"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Market Logo</FormLabel>
                  <FormControl>
                    <FileUpload 
                      apiEndpoint='marketLogo'
                      onChange={field.onChange}
                      value={field.value}
                    />
                  </FormControl>
                </FormItem>
              )}
              ></FormField>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AlertDialog>
  )
}

export default MarketDetails;
