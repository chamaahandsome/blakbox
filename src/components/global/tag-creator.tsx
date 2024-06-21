// 'use client'
// import { Tag } from '@prisma/client'
// import { useRouter } from 'next/navigation'
// import React, { useEffect, useState } from 'react'
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from '../ui/alert-dialog'
// import TagComponent from './tag'
// import { PlusCircleIcon, TrashIcon, X } from 'lucide-react'
// import { toast } from '../ui/use-toast'
// import { v4 } from 'uuid'
// import {
//   deleteTag,
//   getTagsForVendor,
//   saveActivityLogsNotification,
//   upsertTag,
// } from '@/lib/queries'

// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
//   CommandSeparator,
// } from '@/components/ui/command'

// type Props = {
//   vendorId: string
//   getSelectedTags: (tags: Tag[]) => void
//   defaultTags?: Tag[]
// }

// const TagColors = ['BLUE', 'ORANGE', 'ROSE', 'PURPLE', 'GREEN'] as const
// export type TagColor = (typeof TagColors)[number]

// const TagCreator = ({ getSelectedTags, vendorId, defaultTags }: Props) => {
//   const [selectedTags, setSelectedTags] = useState<Tag[]>(defaultTags || [])
//   const [tags, setTags] = useState<Tag[]>([])
//   const router = useRouter()
//   const [value, setValue] = useState('')
//   const [selectedColor, setSelectedColor] = useState('')

//   useEffect(() => {
//     getSelectedTags(selectedTags)
//   }, [selectedTags])

//   useEffect(() => {
//     if (vendorId) {
//       const fetchData = async () => {
//         const response = await getTagsForVendor(vendorId)
//         if (response) setTags(response.Tags)
//       }
//       fetchData()
//     }
//   }, [vendorId])

//   const handleDeleteSelection = (tagId: string) => {
//     setSelectedTags(selectedTags.filter((tag) => tag.id !== tagId))
//   }

//   const handleAddTag = async () => {
//     if (!value) {
//       toast({
//         variant: 'destructive',
//         title: 'Tags need to have a name',
//       })
//       return
//     }
//     if (!selectedColor) {
//       toast({
//         variant: 'destructive',
//         title: 'Please Select a color',
//       })
//       return
//     }
//     const tagData: Tag = {
//       color: selectedColor,
//       createdAt: new Date(),
//       id: v4(),
//       name: value,
//       vendorId,
//       updatedAt: new Date(),
//     }

//     setTags([...tags, tagData])
//     setValue('')
//     setSelectedColor('')
//     try {
//       const response = await upsertTag(vendorId, tagData)
//       toast({
//         title: 'Created the tag',
//       })

//       await saveActivityLogsNotification({
//         marketId: undefined,
//         description: `Updated a tag | ${response?.name}`,
//         vendorId: vendorId,
//       })
//     } catch (error) {
//       toast({
//         variant: 'destructive',
//         title: 'Could not create tag',
//       })
//     }
//   }

//   const handleAddSelections = (tag: Tag) => {
//     if (selectedTags.every((t) => t.id !== tag.id)) {
//       setSelectedTags([...selectedTags, tag])
//     }
//   }
//   const handleDeleteTag = async (tagId: string) => {
//     setTags(tags.filter((tag) => tag.id !== tagId))
//     try {
//       const response = await deleteTag(tagId)
//       toast({
//         title: 'Deleted tag',
//         description: 'The tag is deleted from your account.',
//       })

//       await saveActivityLogsNotification({
//         marketId: undefined,
//         description: `Deleted a tag | ${response?.name}`,
//         vendorId: vendorId,
//       })

//       router.refresh()
//     } catch (error) {
//       toast({
//         variant: 'destructive',
//         title: 'Could not delete tag',
//       })
//     }
//   }

//   return (
//     <AlertDialog>
//       <Command className="bg-transparent">
//         {!!selectedTags.length && (
//           <div className="flex flex-wrap gap-2 p-2 bg-background border-2 border-border rounded-md">
//             {selectedTags.map((tag) => (
//               <div
//                 key={tag.id}
//                 className="flex items-center"
//               >
//                 <TagComponent
//                   title={tag.name}
//                   colorName={tag.color}
//                 />
//                 <X
//                   size={14}
//                   className="text-muted-foreground cursor-pointer"
//                   onClick={() => handleDeleteSelection(tag.id)}
//                 />
//               </div>
//             ))}
//           </div>
//         )}
//         <div className="flex items-center gap-2 my-2">
//           {TagColors.map((colorName) => (
//             <TagComponent
//               key={colorName}
//               selectedColor={setSelectedColor}
//               title=""
//               colorName={colorName}
//             />
//           ))}
//         </div>
//         <div className="relative">
//           <CommandInput
//             placeholder="Search for tag..."
//             value={value}
//             onValueChange={setValue}
//           />
//           <PlusCircleIcon
//             onClick={handleAddTag}
//             size={20}
//             className="absolute top-1/2 transform -translate-y-1/2 right-2 hover:text-primary transition-all cursor-pointer text-muted-foreground"
//           />
//         </div>
//         <CommandList>
//           <CommandSeparator />
//           <CommandGroup heading="Tags">
//             {tags.map((tag) => (
//               <CommandItem
//                 key={tag.id}
//                 className="hover:!bg-secondary !bg-transparent flex items-center justify-between !font-light cursor-pointer"
//               >
//                 <div onClick={() => handleAddSelections(tag)}>
//                   <TagComponent
//                     title={tag.name}
//                     colorName={tag.color}
//                   />
//                 </div>

//                 <AlertDialogTrigger>
//                   <TrashIcon
//                     size={16}
//                     className="cursor-pointer text-muted-foreground hover:text-rose-400  transition-all"
//                   />
//                 </AlertDialogTrigger>
//                 <AlertDialogContent>
//                   <AlertDialogHeader>
//                     <AlertDialogTitle className="text-left">
//                       Are you sure?
//                     </AlertDialogTitle>
//                     <AlertDialogDescription className="text-left">
//                       This action CANNOT BE UNDONE. This will permanently delete
//                       your the tag and remove it from our servers.
//                     </AlertDialogDescription>
//                   </AlertDialogHeader>
//                   <AlertDialogFooter className="items-center">
//                     <AlertDialogCancel>Cancel</AlertDialogCancel>
//                     <AlertDialogAction
//                       className="bg-destructive"
//                       onClick={() => handleDeleteTag(tag.id)}
//                     >
//                       Delete Tag
//                     </AlertDialogAction>
//                   </AlertDialogFooter>
//                 </AlertDialogContent>
//               </CommandItem>
//             ))}
//           </CommandGroup>
//           <CommandEmpty>No results found.</CommandEmpty>
//         </CommandList>
//       </Command>
//     </AlertDialog>
//   )
// }

// export default TagCreator

'use client'
import { Tag } from '@prisma/client'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog'
import TagComponent from './tag'
import { PlusCircleIcon, TrashIcon, X } from 'lucide-react'
import { toast } from '../ui/use-toast'
import { v4 } from 'uuid'
import {
  deleteTag,
  getTagsForVendor,
  saveActivityLogsNotification,
  upsertTag,
} from '@/lib/queries'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'

type Props = {
  vendorId: string
  getSelectedTags: (tags: Tag[]) => void
  defaultTags?: Tag[]
}

const TagColors = ['BLUE', 'ORANGE', 'ROSE', 'PURPLE', 'GREEN'] as const
export type TagColor = (typeof TagColors)[number]

const TagCreator = ({ getSelectedTags, vendorId, defaultTags }: Props) => {
  const [selectedTags, setSelectedTags] = useState<Tag[]>(defaultTags || [])
  const [tags, setTags] = useState<Tag[]>([])
  const router = useRouter()
  const [value, setValue] = useState('')
  const [selectedColor, setSelectedColor] = useState<TagColor | ''>('')

  useEffect(() => {
    getSelectedTags(selectedTags)
  }, [selectedTags])

  useEffect(() => {
    if (vendorId) {
      const fetchData = async () => {
        const response = await getTagsForVendor(vendorId)
        if (response) setTags(response.Tags)
      }
      fetchData()
    }
  }, [vendorId])

  const handleDeleteSelection = (tagId: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag.id !== tagId))
  }

  const handleAddTag = async () => {
    if (!value) {
      toast({
        variant: 'destructive',
        title: 'Tags need to have a name',
      })
      return
    }
    if (!selectedColor) {
      toast({
        variant: 'destructive',
        title: 'Please Select a color',
      })
      return
    }
    const tagData: Tag = {
      color: selectedColor,
      createdAt: new Date(),
      id: v4(),
      name: value,
      vendorId,
      updatedAt: new Date(),
    }

    setTags([...tags, tagData])
    setValue('')
    setSelectedColor('')
    try {
      const response = await upsertTag(vendorId, tagData)
      toast({
        title: 'Created the tag',
      })

      await saveActivityLogsNotification({
        marketId: undefined,
        description: `Updated a tag | ${response?.name}`,
        vendorId: vendorId,
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Could not create tag',
      })
    }
  }

  const handleAddSelections = (tag: Tag) => {
    if (selectedTags.every((t) => t.id !== tag.id)) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    setTags(tags.filter((tag) => tag.id !== tagId))
    try {
      const response = await deleteTag(tagId)
      toast({
        title: 'Deleted tag',
        description: 'The tag is deleted from your account.',
      })

      await saveActivityLogsNotification({
        marketId: undefined,
        description: `Deleted a tag | ${response?.name}`,
        vendorId: vendorId,
      })

      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Could not delete tag',
      })
    }
  }

  return (
    <AlertDialog>
      <Command className="bg-transparent">
        {!!selectedTags.length && (
          <div className="flex flex-wrap gap-2 p-2 bg-background border-2 border-border rounded-md">
            {selectedTags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center"
              >
                <TagComponent
                  title={tag.name}
                  colorName={tag.color}
                />
                <X
                  size={14}
                  className="text-muted-foreground cursor-pointer"
                  onClick={() => handleDeleteSelection(tag.id)}
                />
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 my-2 pl-1">
          {TagColors.map((colorName) => (
            <TagComponent
              key={colorName}
              //@ts-ignore
              selectedColor={setSelectedColor}
              title=""
              colorName={colorName}
              selected={selectedColor === colorName}
            />
          ))}
        </div>
        <div className="relative">
          <CommandInput
            placeholder="Search for tag..."
            value={value}
            onValueChange={setValue}
          />
          <PlusCircleIcon
            onClick={handleAddTag}
            size={20}
            className="absolute top-1/2 transform -translate-y-1/2 right-2 hover:text-primary transition-all cursor-pointer text-muted-foreground"
          />
        </div>
        <CommandList>
          <CommandSeparator />
          <CommandGroup heading="Tags">
            {tags.map((tag) => (
              <CommandItem
                key={tag.id}
                className="hover:!bg-secondary !bg-transparent flex items-center justify-between !font-light cursor-pointer"
              >
                <div onClick={() => handleAddSelections(tag)}>
                  <TagComponent
                    title={tag.name}
                    colorName={tag.color}
                  />
                </div>

                <AlertDialogTrigger>
                  <TrashIcon
                    size={16}
                    className="cursor-pointer text-muted-foreground hover:text-rose-400  transition-all"
                  />
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-left">
                      Are you sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-left">
                      This action CANNOT BE UNDONE. This will permanently delete
                      your the tag and remove it from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="items-center">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive"
                      onClick={() => handleDeleteTag(tag.id)}
                    >
                      Delete Tag
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandEmpty>No results found.</CommandEmpty>
        </CommandList>
      </Command>
    </AlertDialog>
  )
}

export default TagCreator