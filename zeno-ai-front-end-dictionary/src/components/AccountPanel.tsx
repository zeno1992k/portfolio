import { Button, Modal, ModalClose, ModalContainer, ModalContent, ModalContentItem, ModalNavigation, SectionMessage, TextButton, Typography } from '@montage-ui/core';
import { IconArrowUpRight, IconCheck, IconLogoGoogleColor, IconPerson, IconRefresh } from '@montage-ui/icon';
import { useAuth } from '../lib/AuthProvider';
import { useLearning } from '../lib/LearningProvider';
import { brand } from '../lib/brand';
import { BrandLogo } from './BrandLogo';
import { AppearanceSettings } from './AppearanceSettings';

export function AccountPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, loading, configured, error, signInWithGoogle, signOut } = useAuth();
  const { syncStatus, syncError, retrySync } = useLearning();
  const name = typeof user?.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : '학습자';
  const syncLabel = syncStatus === 'synced' ? '계정에 저장됐어요' : syncStatus === 'syncing' || syncStatus === 'loading' ? '학습 기록을 맞추고 있어요' : syncStatus === 'pending' ? '연결되면 계정에 저장할게요' : '기기에 저장된 기록으로 학습할 수 있어요';

  return <Modal open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
    <ModalContainer variant="bottom" size="medium" className="account-modal">
      <ModalNavigation trailingContent={<ModalClose aria-label="계정 화면 닫기" />}>내 계정</ModalNavigation>
      <ModalContent>
        <ModalContentItem className="account-content" flexDirection="column" alignItems="stretch" gap="20px">
          {!user && <div className="account-brand"><BrandLogo className="account-brand-logo" /><Typography as="span" variant="headline1" weight="bold" color="semantic.label.normal" className="brand-name">{brand.appName}</Typography></div>}
          <div className="account-intro">
            <Typography as="h2" variant="title3" weight="bold">{user ? `${name}님, 반가워요` : '어디서든, 이어서 익혀요'}</Typography>
            <Typography as="p" variant="body2-reading" color="semantic.label.alternative">{user ? '구글 계정으로 연결되어 있어요.' : '구글로 시작하면 학습 기록과 저장한 용어를 다른 기기에서도 이어서 볼 수 있어요.'}</Typography>
          </div>
          {user ? <>
            <div className="account-identity"><IconPerson width={20} height={20} aria-hidden="true" /><Typography variant="body2" className="account-email">{user.email ?? '구글 계정'}</Typography></div>
            <div className="account-sync" role="status">{syncStatus === 'synced' && <IconCheck width={20} height={20} aria-hidden="true" />}<Typography variant="label1-reading" color="semantic.label.alternative">{syncLabel}</Typography></div>
            {syncError && <SectionMessage variant="cautionary" role="alert">{syncError}</SectionMessage>}
            <Button variant="outlined" color="assistive" size="large" fullWidth onClick={() => { void retrySync(); }} disabled={loading || syncStatus === 'loading' || syncStatus === 'syncing'} leadingContent={<IconRefresh aria-hidden="true" />}>기록 동기화하기</Button>
            <TextButton color="assistive" onClick={() => { void signOut(); }} disabled={loading}>로그아웃</TextButton>
          </> : <>
            <Button className="google-login-button" variant="outlined" color="assistive" size="large" fullWidth leadingContent={<IconLogoGoogleColor width={20} height={20} aria-hidden="true" />} onClick={() => { void signInWithGoogle(); }} loading={loading} disabled={!configured || loading}>Google로 계속하기</Button>
            {!configured && <Typography as="p" variant="label1-reading" color="semantic.label.alternative" role="status">로그인을 준비하고 있어요. 지금은 기기에 기록이 저장돼요.</Typography>}
            <TextButton color="assistive" onClick={onClose}>지금은 로그인 없이 학습하기</TextButton>
            <Typography as="p" variant="caption1" color="semantic.label.alternative">로그인 없이 공부한 기록도 처음 연결한 계정으로 가져와요.</Typography>
          </>}
          {error && <SectionMessage variant="cautionary" role="alert">{error}</SectionMessage>}
          <AppearanceSettings />
          <TextButton className="zeno-docs-link" as="a" href={brand.docsUrl} target="_blank" rel="noopener noreferrer" trailingContent={<IconArrowUpRight width={16} height={16} aria-hidden="true" />}>Zeno Docs에서 더 깊게 읽기</TextButton>
        </ModalContentItem>
      </ModalContent>
    </ModalContainer>
  </Modal>;
}
