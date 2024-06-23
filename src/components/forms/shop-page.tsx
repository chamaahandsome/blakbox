'use client'
import React, { useEffect } from 'react'
import { z } from 'zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '../ui/input'

import { Button } from '../ui/button'
import Loading from '../global/loading'
import { useToast } from '../ui/use-toast'
import { ShopPage } from '@prisma/client'
import { ShopPageSchema } from '@/lib/types'
import {
  deleteShopePage,
  getShops,
  saveActivityLogsNotification,
  upsertShopPage,
} from '@/lib/queries'
import { useRouter } from 'next/navigation'
import { v4 } from 'uuid'
import { CopyPlusIcon, Trash } from 'lucide-react'

interface CreateShopPageProps {
  defaultData?: ShopPage
  shopId: string
  order: number
  vendorId: string
}

const CreateShopPage: React.FC<CreateShopPageProps> = ({
  defaultData,
  shopId,
  order,
  vendorId,
}) => {
  const { toast } = useToast()
  const router = useRouter()
  //ch
  const form = useForm<z.infer<typeof ShopPageSchema>>({
    resolver: zodResolver(ShopPageSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      pathName: '',
    },
  })

  useEffect(() => {
    if (defaultData) {
      form.reset({ name: defaultData.name, pathName: defaultData.pathName })
    }
  }, [defaultData])

  const onSubmit = async (values: z.infer<typeof ShopPageSchema>) => {
    if (order !== 0 && !values.pathName)
      return form.setError('pathName', {
        message:
          "Pages other than the first page in the shop require a path name example 'secondstep'.",
      })
    try {
      const response = await upsertShopPage(
        vendorId,
        {
          ...values,
          id: defaultData?.id || v4(),
          order: defaultData?.order || order,
          pathName: values.pathName || '',
        },
        shopId
      )

      await saveActivityLogsNotification({
        marketId: undefined,
        description: `Updated a shop page | ${response?.name}`,
        vendorId: vendorId,
      })

      toast({
        title: 'Success',
        description: 'Saves Shop Page Details',
      })
      router.refresh()
    } catch (error) {
      console.log(error)
      toast({
        variant: 'destructive',
        title: 'Oppse!',
        description: 'Could Save Shop Page Details',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shop Page</CardTitle>
        <CardDescription>
          Shop pages are flow in the order they are created by default. You
          can move them around to change their order.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={form.formState.isSubmitting || order === 0}
              control={form.control}
              name="pathName"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Path Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Path for the page"
                      {...field}
                      value={field.value?.toLowerCase()}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-2">
              <Button
                className="w-22 self-end"
                disabled={form.formState.isSubmitting}
                type="submit"
              >
                {form.formState.isSubmitting ? <Loading /> : 'Save Page'}
              </Button>

              {defaultData?.id && (
                <Button
                  variant={'outline'}
                  className="w-22 self-end border-destructive text-destructive hover:bg-destructive"
                  disabled={form.formState.isSubmitting}
                  type="button"
                  onClick={async () => {
                    const response = await deleteShopePage(defaultData.id)
                    await saveActivityLogsNotification({
                      marketId: undefined,
                      description: `Deleted a shop page | ${response?.name}`,
                      vendorId: vendorId,
                    })
                    router.refresh()
                  }}
                >
                  {form.formState.isSubmitting ? <Loading /> : <Trash />}
                </Button>
              )}
              {defaultData?.id && (
                <Button
                  variant={'outline'}
                  size={'icon'}
                  disabled={form.formState.isSubmitting}
                  type="button"
                  onClick={async () => {
                    const response = await getShops(vendorId)
                    const lastShopPage = response.find(
                      (shop) => shop.id === shopId
                    )?.ShopPages.length

                    await upsertShopPage(
                      vendorId,
                      {
                        ...defaultData,
                        id: v4(),
                        order: lastShopPage ? lastShopPage : 0,
                        visits: 0,
                        name: `${defaultData.name} Copy`,
                        pathName: `${defaultData.pathName}copy`,
                        content: defaultData.content,
                      },
                      shopId
                    )
                    toast({
                      title: 'Success',
                      description: 'Saves Shop Page Details',
                    })
                    router.refresh()
                  }}
                >
                  {form.formState.isSubmitting ? <Loading /> : <CopyPlusIcon />}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default CreateShopPage
