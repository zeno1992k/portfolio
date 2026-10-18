'use client'

import {
  Button,
  IconButton,
  Modal,
  ModalClose,
  ModalContainer,
  ModalContent,
  ModalContentItem,
  ModalNavigation,
  SectionMessage,
  TextButton,
  Typography,
} from '@montage-ui/core'
import { IconCheck, IconLogoGoogleColor, IconPerson } from '@montage-ui/icon'
import { useState } from 'react'
import { useAuth } from './auth-provider'
import { BrandLogo } from './brand-logo'
import { MontageScope } from './montage-scope'
import styles from './auth-account.module.css'

export function AuthAccount() {
  const [open, setOpen] = useState(false)
  const { configured, error, loading, signInWithGoogle, signOut, user } = useAuth()
  const name = typeof user?.user_metadata?.full_name === 'string'
    ? user.user_metadata.full_name
    : '학습자'

  return (
    <MontageScope>
      <div className={`docs-navbar-account ${styles.root}`}>
        <IconButton
          aria-label={user ? `${name} 계정` : '로그인'}
          className={styles.trigger}
          onClick={() => setOpen(true)}
          size="small"
          title={user ? `${name} 계정` : '로그인'}
          variant="normal"
        >
          <IconPerson aria-hidden="true" height={20} width={20} />
          {user && <span aria-hidden="true" className={styles.onlineDot} />}
        </IconButton>

        <Modal open={open} onOpenChange={setOpen}>
          <ModalContainer className={styles.panel} resize="hug" size="small" variant="popup">
            <ModalNavigation trailingContent={<ModalClose aria-label="계정 창 닫기" />}>
              내 계정
            </ModalNavigation>
            <ModalContent>
              <ModalContentItem
                alignItems="stretch"
                className={styles.content}
                flexDirection="column"
                gap="18px"
              >
                <div className={styles.brand}>
                  <BrandLogo size={28} />
                  <Typography as="span" variant="headline1" weight="bold">
                    Zeno AI Docs
                  </Typography>
                </div>

                <div className={styles.intro}>
                  <Typography as="h2" variant="title3" weight="bold">
                    {user ? `${name}님, 반갑습니다` : '학습 기록을 이어서 보세요'}
                  </Typography>
                  <Typography as="p" color="semantic.label.alternative" variant="body2-reading">
                    {user
                      ? 'Supabase 인증으로 Google 계정이 연결되어 있습니다.'
                      : 'Google 계정으로 간단히 로그인할 수 있습니다. 읽음 기록은 이 기기에만 저장됩니다.'}
                  </Typography>
                </div>

                {user ? (
                  <>
                    <div className={styles.identity}>
                      <IconPerson aria-hidden="true" height={20} width={20} />
                      <Typography className={styles.email} variant="body2">
                        {user.email ?? 'Google 계정'}
                      </Typography>
                    </div>
                    <div className={styles.sync} role="status">
                      <IconCheck aria-hidden="true" height={20} width={20} />
                      <Typography color="semantic.label.alternative" variant="label1-reading">
                        현재 읽음 기록은 브라우저 로컬 저장소에만 보관됩니다.
                      </Typography>
                    </div>
                    <TextButton
                      color="assistive"
                      disabled={loading}
                      onClick={() => void signOut()}
                    >
                      로그아웃
                    </TextButton>
                  </>
                ) : (
                  <>
                    <Button
                      color="assistive"
                      disabled={!configured || loading}
                      fullWidth
                      leadingContent={<IconLogoGoogleColor aria-hidden="true" height={20} width={20} />}
                      loading={loading}
                      onClick={() => void signInWithGoogle()}
                      size="large"
                      variant="outlined"
                    >
                      Google로 계속하기
                    </Button>
                    <TextButton color="assistive" onClick={() => setOpen(false)}>
                      로그인 없이 계속 읽기
                    </TextButton>
                  </>
                )}

                {error && (
                  <SectionMessage role="alert" variant="cautionary">
                    {error}
                  </SectionMessage>
                )}
              </ModalContentItem>
            </ModalContent>
          </ModalContainer>
        </Modal>
      </div>
    </MontageScope>
  )
}
